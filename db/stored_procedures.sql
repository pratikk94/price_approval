CREATE PROCEDURE GetAllCustomersEndUse 
AS
BEGIN
    SELECT code, name FROM customer where category IN ('END-USE')
END;

CREATE PROCEDURE GetAllCustomersConsignee
AS
BEGIN
	SELECT code, name FROM customer where category IN ('DOM-CONS','EXP-CONS')
END;

CREATE PROCEDURE GetAllCustomers
AS
BEGIN
	SELECT code, name FROM customer WHERE category IN ('DOM_CUST', 'EXP_CUST', 'INTERDIV_CUST')
END;

CREATE PROCEDURE GetPaymentTerms
AS
BEGIN
	SELECT terms as name, payment_terms_id as code FROM payment_terms
END;

CREATE PROCEDURE GetPlants
AS
BEGIN 
	SELECT name, id as code FROM plant
END;

CREATE PROCEDURE GetMaterialsByFSC
    @fsc VARCHAR(255) 
AS
BEGIN
    SELECT grade AS name, id AS code
    FROM material
    WHERE fsc = @fsc;
END;

CREATE PROCEDURE FetchEmployees
AS
BEGIN
	SELECT employee_name as name, employee_id as id FROM user_master
END;

CREATE PROCEDURE FetchRoles
AS
BEGIN
SELECT * FROM roles
END;

CREATE PROCEDURE FetchRegion
AS
BEGIN
SELECT * from region
END;

CREATE PROCEDURE InsertEmployeeRole
    @employee_id VARCHAR(255),
    @employee_name VARCHAR(255),
    @role VARCHAR(100),
    @region VARCHAR(100),
    @created_by VARCHAR(255),
    @created_date DATETIME,
    @active INT
AS
BEGIN
    INSERT INTO define_roles (employee_id, employee_name, role, region, created_by, created_date, active) 
    VALUES (@employee_id, @employee_name, @role, @region, @created_by, @created_date, @active);
END;


USE PriceApprovalSystem;
CREATE PROCEDURE FetchDefinedRoles
AS
BEGIN
	SELECT * FROM define_roles
END;

CREATE PROCEDURE FetchDefinedRoleById
    @id INT
AS
BEGIN
    SELECT * FROM define_roles WHERE id = @id;
END

CREATE PROCEDURE FetchPriceRequest
	@status INT
AS
BEGIN 
SELECT 
      pra.req_id,
      (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
          FROM customer c
          JOIN STRING_SPLIT(pra.customer_id, ',') AS splitCustomerIds ON c.code = TRY_CAST(splitCustomerIds.value AS INT)
      ) AS CustomerNames,
      (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
          FROM customer c
          JOIN STRING_SPLIT(pra.consignee_id, ',') AS splitConsigneeIds ON c.code = TRY_CAST(splitConsigneeIds.value AS INT)
      ) AS ConsigneeNames,
      (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
          FROM customer c
          JOIN STRING_SPLIT(pra.end_use_id, ',') AS splitEndUseIds ON c.code = TRY_CAST(splitEndUseIds.value AS INT)
      ) AS EndUseNames,
      pra.*,
      prt.*,
      rs.created_at as created_on,rs.last_updated_at as updated_on,rs.status_updated_by_id as created_by
  FROM 
      price_approval_requests pra
  LEFT JOIN
      report_status rs ON pra.req_id = rs.report_id
  LEFT JOIN 
      price_approval_requests_price_table prt ON pra.req_id = prt.req_id
      WHERE rs.status = @status
END


CREATE PROCEDURE SearchDefineRoles
    @role NVARCHAR(255) = '',
    @region NVARCHAR(255) = ''
AS
BEGIN
    SET NOCOUNT ON;
	IF @role = '' SET @role = '%';
    IF @region = '' SET @region = '%';

    SELECT * FROM define_roles 
    WHERE role LIKE @role AND region LIKE @region;
END;

CREATE PROCEDURE FetchProfitCenters
AS
BEGIN
SELECT  [id], [name]
    FROM [PriceApprovalSystem].[dbo].[profit_center]
    ORDER BY name ASC;
END

CREATE PROCEDURE FetchAllDefinedRoles
AS
BEGIN
SELECT  * from define_roles
END


CREATE PROCEDURE FetchRules
AS
BEGIN
SELECT r.*, STRING_AGG(dr.employee_name, ', ') AS approver_names
    FROM rules r
    CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(r.approvers, '[', ''), ']', ''), ',') AS s
    JOIN define_roles dr ON dr.employee_id = s.value 
    WHERE r.status = 1
    -- TRY_CAST(s.value AS INT)
    GROUP BY r.name,r.id,r.region
          ,r.profit_center
          ,r.valid_from
          ,r.valid_to
          ,r.approvers
          ,r.status
          ,r.created_by
    ,r.created_date
END;


CREATE PROCEDURE FetchRuleById
	@id INT
AS
BEGIN 
SELECT r.*, STRING_AGG(dr.employee_name, ', ') AS approver_names
    FROM rules r
    CROSS APPLY STRING_SPLIT(REPLACE(REPLACE(r.approvers, '[', ''), ']', ''), ',') AS s
    JOIN define_roles dr ON dr.employee_id = s.value 
    WHERE r.status = 1 and r.id = @id
    GROUP BY r.name,r.id,r.region
          ,r.profit_center
          ,r.valid_from
          ,r.valid_to
          ,r.approvers
          ,r.status
          ,r.created_by
    ,r.created_date
end;


CREATE PROCEDURE FetchReportStatus
AS
BEGIN 
SELECT  * from report_status
END


CREATE PROCEDURE FetchReportStatusById
@id VARCHAR
AS
BEGIN 
SELECT  * from report_status where id = @id
END


CREATE PROCEDURE InsertPriceApprovalRequest
    @customerIds NVARCHAR(MAX),
    @consigneeIds NVARCHAR(MAX),
    @plants NVARCHAR(MAX),
    @endUseIds NVARCHAR(MAX),
    @endUseSegmentIds NVARCHAR(MAX),
    @paymentTermsId NVARCHAR(MAX),
    @validFrom DATE,
    @validTo DATE,
    @fsc NVARCHAR(50),
    @mappint_type int
AS
BEGIN
    INSERT INTO price_approval_requests 
        (customer_id, consignee_id, plant, end_use_id, end_use_segment_id, payment_terms_id, valid_from, valid_to, fsc, mappint_type) 
    VALUES 
        (@customerIds, @consigneeIds, @plants, @endUseIds, @endUseSegmentIds, @paymentTermsId, @validFrom, @validTo, @fsc, @mappint_type);

    SELECT SCOPE_IDENTITY() AS id;
END


CREATE PROCEDURE InsertPriceApprovalRequestPriceTable
    @reqId NVARCHAR(50),
    @grade NVARCHAR(50),
    @gradeType NVARCHAR(50),
    @gsmFrom INT,
    @gsmTo INT,
    @agreedPrice DECIMAL(10, 2),
    @specialDiscount DECIMAL(10, 2),
    @reelDiscount DECIMAL(10, 2),
    @packUpcharge DECIMAL(10, 2),
    @tpc DECIMAL(10, 2),
    @offlineDiscount DECIMAL(10, 2),
    @netNSR DECIMAL(10, 2),
    @oldNetNSR DECIMAL(10, 2)
AS
BEGIN
    INSERT INTO price_approval_requests_price_table 
        (req_id, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, reel_discount, pack_upcharge, tpc, offline_discount, net_nsr, old_net_nsr) 
    VALUES 
        (@reqId, @grade, @gradeType, @gsmFrom, @gsmTo, @agreedPrice, @specialDiscount, @reelDiscount, @packUpcharge, @tpc, @offlineDiscount, @netNSR, @oldNetNSR);
END


CREATE PROCEDURE InsertReportStatus
    @report_id INT,
    @status NVARCHAR(255),
    @status_updated_by_id INT
AS
BEGIN
    INSERT INTO report_status (report_id, status, status_updated_by_id, created_at, last_updated_at)
    VALUES (@report_id, @status, @status_updated_by_id, GETDATE(), GETDATE());
END


CREATE PROCEDURE FetchPriceRequestById
@reqId INT
AS
BEGIN
SELECT 
    pra.*,
    prt.*,
    rs.created_at,rs.last_updated_at,rs.status_updated_by_id,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.customer_id, ',') AS splitCustomerIds ON c.code = TRY_CAST(splitCustomerIds.value AS INT)
    ) AS CustomerNames,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.consignee_id, ',') AS splitConsigneeIds ON c.code = TRY_CAST(splitConsigneeIds.value AS INT)
    ) AS ConsigneeNames,
    (SELECT STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY c.name) 
        FROM customer c
        JOIN STRING_SPLIT(pra.end_use_id, ',') AS splitEndUseIds ON c.code = TRY_CAST(splitEndUseIds.value AS INT)
    ) AS EndUseNames
FROM 
    price_approval_requests pra
LEFT JOIN 
    price_approval_requests_price_table prt ON pra.req_id = prt.req_id
  LEFT JOIN
      report_status rs ON pra.req_id = rs.report_id
WHERE 
    pra.req_id = @reqId
	END;

CREATE PROCEDURE UpdateReportStatus
    @reportId INT,
    @newStatus NVARCHAR(255),
    @statusUpdatedById INT
AS
BEGIN
    UPDATE report_status
    SET status = @newStatus,
        status_updated_by_id = @statusUpdatedById,
        last_updated_at = GETDATE()
    WHERE report_id = @reportId;
END

