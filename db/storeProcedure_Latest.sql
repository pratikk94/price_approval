CREATE PROCEDURE FetchUserByEmployeeId
    @employee_id VARCHAR(255) 
AS
BEGIN
    SELECT *
    FROM define_roles
    WHERE employee_id = @employee_id;
END;

CREATE PROCEDURE FetchRoleByRoleId
    @role VARCHAR(255) 
AS
BEGIN
    SELECT *
    FROM role_matrix
    WHERE role = @role;
END;


CREATE PROCEDURE GetTransactionDetails
    @Status INT,
    @Role NVARCHAR(50)
AS
BEGIN
    DECLARE @StatusSTR NVARCHAR(MAX);
    DECLARE @StatusIM NVARCHAR(MAX);

    -- Set @StatusSTR and @StatusIM based on @Status
    IF @Status = 0
    BEGIN
        SET @StatusSTR = 'AND currently_pending_with = ''' + @Role + '''';
        SET @StatusIM = 'status != 1 AND status != -1';
    END
    ELSE
    BEGIN
        SET @StatusSTR = '';
        SET @StatusIM = 'status = ' + CAST(@Status AS NVARCHAR(10));
    END

    -- Construct the main SQL query using CTEs
    DECLARE @SqlQuery NVARCHAR(MAX);

    SET @SqlQuery = '
    WITH LatestRequests AS (
        SELECT 
            req_id, 
            status, 
            ROW_NUMBER() OVER (PARTITION BY req_id ORDER BY id DESC) AS rn
        FROM [PriceApprovalSystem].[dbo].[requests_mvc]
    ),
    FilteredRequests AS (
        SELECT req_id
        FROM LatestRequests
        WHERE rn = 1 AND ' + @StatusIM + '
    ),
    MaxIds AS (
        SELECT MAX(id) AS maxId, request_id
        FROM transaction_mvc
        WHERE request_id IN (SELECT req_id FROM FilteredRequests)
        GROUP BY request_id
    ),
    MaxDetails AS (
        SELECT m.maxId, m.request_id, t.current_status
        FROM transaction_mvc t
        INNER JOIN MaxIds m ON t.id = m.maxId
    ),
    RelatedTransactions AS (
        SELECT t.*
        FROM transaction_mvc t
        INNER JOIN MaxDetails m ON t.request_id = m.request_id AND t.current_status = m.current_status
    )
    SELECT *
    FROM RelatedTransactions
    WHERE EXISTS (
        SELECT 1
        FROM transaction_mvc
        WHERE request_id = RelatedTransactions.request_id
        AND current_status = RelatedTransactions.current_status
        AND id != RelatedTransactions.id
    )
    ' + @StatusSTR + '
    UNION
    SELECT *
    FROM transaction_mvc
    WHERE id IN (SELECT maxId FROM MaxDetails)
    ' + @StatusSTR + ';';

    -- Execute the constructed SQL query
    EXEC sp_executesql @SqlQuery;
END;


CREATE PROCEDURE GetPriceApprovalRequests
    @RequestID NVARCHAR(50),
    @Status INT
AS
BEGIN
    SELECT 
        par.request_name,
        c.name AS customer_name, 
        par.customer_id AS customer_ids,
        consignee.name AS consignee_name, 
        par.consignee_id AS consignee_ids,
        enduse.name AS enduse_name,
        par.end_use_id,
        par.plant,
        par.valid_from,
        par.valid_to,
        par.payment_terms_id
    FROM price_approval_requests par
    LEFT JOIN customer c ON par.customer_id = c.id
    LEFT JOIN customer consignee ON par.consignee_id = consignee.id
    LEFT JOIN customer enduse ON par.end_use_id = enduse.id
    JOIN requests_mvc rs ON par.request_name = rs.req_id
    WHERE par.request_name = @RequestID
      AND rs.status = @Status
      AND (par.customer_id <> '' OR par.consignee_id <> '' OR par.end_use_id <> '');
END;


CREATE PROCEDURE GetPriceApprovalRequestDetails
    @RequestID NVARCHAR(50),
    @Role NVARCHAR(50)
AS
BEGIN
    SELECT 
        PAQ.*, 
        PC.Grade,
        BAV.[key],
        BAV.status 
    FROM price_approval_requests_price_table PAQ 
    INNER JOIN profit_center PC ON PAQ.grade = PC.Grade
    INNER JOIN business_admin_variables BAV ON BAV.value = LEFT(CAST(ABS(PC.Profit_Centre) AS VARCHAR(10)), 1) 
    WHERE PAQ.req_id = @RequestID 
      AND BAV.[key] = @Role;
END;

CREATE PROCEDURE GetCustomersByTypeAndSalesOffice
    @Type INT,
    @SalesOffice NVARCHAR(50) = NULL
AS
BEGIN
    DECLARE @Query NVARCHAR(MAX);

    IF @Type = 1
    BEGIN
        SET @Query = 'SELECT * FROM customer WHERE Category LIKE ''%CUST%''';
    END
    ELSE IF @Type = 2
    BEGIN
        SET @Query = 'SELECT * FROM customer WHERE Category LIKE ''%CONS%''';
    END
    ELSE IF @Type = 3
    BEGIN
        SET @Query = 'SELECT * FROM customer WHERE Category LIKE ''%end_use%''';
    END

    IF @SalesOffice IS NOT NULL
    BEGIN
        SET @Query = @Query + ' AND sales_office = @salesOffice';
    END

    -- Execute the final query
    EXEC sp_executesql @Query, N'@salesOffice NVARCHAR(50)', @salesOffice;
END;


CREATE PROCEDURE GetProfitCentersByFSC
    @fsc CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT id as code, grade, FSC_Y_N, Grade as name, Profit_Centre as profitCenter 
    FROM profit_center 
    WHERE status = 1 
      AND FSC_Y_N = @fsc;
END;


CREATE PROCEDURE FindLowestPaymentTermForDynamicIds
    @InsertCustomers NVARCHAR(MAX),
    @InsertConsignees NVARCHAR(MAX),
    @InsertEndUses NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Customers TABLE (customer_id NVARCHAR(10));
    DECLARE @Consignees TABLE (consignee_id NVARCHAR(10));
    DECLARE @EndUses TABLE (end_use_id NVARCHAR(10));

    -- Insert into table variables from parameters
    INSERT INTO @Customers (customer_id) VALUES (@InsertCustomers);
    INSERT INTO @Consignees (consignee_id) VALUES (@InsertConsignees);
    INSERT INTO @EndUses (end_use_id) VALUES (@InsertEndUses);

    -- Running the query to find the lowest payment term and its corresponding terms
    SELECT MIN(ptm.payment_term_id) AS LowestPaymentTerm, pt.terms
    FROM dbo.payment_terms_master ptm
    INNER JOIN payment_terms pt ON pt.id = ptm.payment_term_id
    WHERE (ptm.customer_id IN (SELECT customer_id FROM @Customers) OR ptm.customer_id IS NULL)
      AND (ptm.consignee_id IN (SELECT consignee_id FROM @Consignees) OR ptm.consignee_id IS NULL)
      AND (ptm.end_use_id IN (SELECT end_use_id FROM @EndUses) OR ptm.end_use_id IS NULL)
    GROUP BY pt.terms;
END;


CREATE PROCEDURE GetFilesByRequestId
    @requestId NVARCHAR(50) 
AS
BEGIN
    SET NOCOUNT ON;

    SELECT * 
    FROM files f 
    WHERE f.request_id = @requestId;
END;


CREATE PROCEDURE GetBusinessAdminData
    @queryType VARCHAR(255),
    @fsc CHAR(10) = NULL
AS
BEGIN
    IF @queryType = 'payment_terms'
    BEGIN
        -- Result Set 1: Payment Terms
        SELECT terms AS name, payment_terms_id AS code
        FROM payment_terms;
    END
    ELSE IF @queryType = 'plant'
    BEGIN
        -- Result Set 2: Plants
        SELECT name, id AS code
        FROM plant;
    END
    ELSE IF @queryType = 'grade'
    BEGIN
        -- Result Set 3: Materials
        SELECT grade AS name, id AS code
        FROM material
        WHERE fsc = @fsc;
    END
    ELSE IF @queryType = 'user_master'
    BEGIN
        -- Result Set 4: Employees without roles
        SELECT um.employee_name AS name, um.employee_id AS id
        FROM user_master um
        LEFT JOIN define_roles dr ON um.employee_id = dr.employee_id
        WHERE dr.employee_id IS NULL;
    END
    ELSE IF @queryType = 'role'
    BEGIN
        -- Result Set 5: Roles
        SELECT *
        FROM roles;
    END
    ELSE IF @queryType = 'region'
    BEGIN
        -- Result Set 6: Regions
        SELECT *
        FROM region;
    END
END;
GO

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
    OUTPUT INSERTED.*
    VALUES (@employee_id, @employee_name, @role, @region, @created_by, @created_date, @active);
END;



CREATE PROCEDURE FetchProfitCenters
AS
BEGIN
SELECT  *
    FROM [PriceApprovalSystem].[dbo].[profit_center]
    ORDER BY Grade ASC;
END
