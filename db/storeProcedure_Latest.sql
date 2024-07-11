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
        CONVERT(VARCHAR, CAST(valid_from AS DATETIME), 103) AS valid_from,
        CONVERT(VARCHAR, CAST(valid_to AS DATETIME), 103) AS valid_to,
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




CREATE PROCEDURE UpdateAndInsertRule
    @RuleData NVARCHAR(MAX),
    @Region nvarchar(150)
AS
BEGIN
    -- Start a transaction
    BEGIN TRANSACTION;

    BEGIN TRY
    
        -- Declare a variable to hold the rule_id value
    DECLARE @selectedRuleId INT = 0;

-- get the rule_id from the rule_mvc table
    SELECT @selectedRuleId = MAX(rule_id)
    FROM rule_mvc

        -- Perform the update operation to set is_active as 0
        UPDATE rule_mvc SET is_active = 0 WHERE region = @Region;

        
            -- Increment the rule_id
    SET @selectedRuleId = @selectedRuleId + 1;

        -- Perform the insert operation
    INSERT INTO rule_mvc
        (rule_id, region, approver,level,valid_from,valid_to,is_active)
    OUTPUT
    INSERTED.*
    SELECT
        @selectedRuleId,
        JSON_VALUE(value, '$.region'),
        JSON_VALUE(value, '$.approver'),
        JSON_VALUE(value, '$.level'),
        JSON_VALUE(value, '$.valid_from'),
        JSON_VALUE(value, '$.valid_to'),
        JSON_VALUE(value, '$.is_active')
    FROM OPENJSON(@RuleData);

        -- If both operations succeed, commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- If there is an error, roll back the transaction
        ROLLBACK TRANSACTION;

        -- Optionally, you can handle the error or re-throw it
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT
        @ErrorMessage = ERROR_MESSAGE(),
        @ErrorSeverity = ERROR_SEVERITY(),
        @ErrorState = ERROR_STATE();

        -- Raise the error with the original error information
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;

CREATE PROCEDURE GetReports
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
    CONVERT(VARCHAR, CAST(valid_from AS DATETIME2), 103) AS valid_from,
    CONVERT(VARCHAR, CAST(valid_to AS DATETIME2), 103) AS valid_to,
    par.payment_terms_id
FROM price_approval_requests par
LEFT JOIN customer c ON par.customer_id = c.id
LEFT JOIN customer consignee ON par.consignee_id = consignee.id
LEFT JOIN customer enduse ON par.end_use_id = enduse.id
JOIN requests_mvc rs ON par.request_name = rs.req_id
WHERE par.request_name = @RequestID 
  AND rs.status = @Status 
  AND (par.customer_id <> '' OR par.consignee_id <> '' OR par.end_use_id <> '')
GROUP BY
    par.request_name,
    c.name, 
    par.customer_id,
    consignee.name, 
    par.consignee_id,
    enduse.name,
    par.end_use_id,
    par.plant,
    CONVERT(VARCHAR, CAST(valid_from AS DATETIME2), 103),
    CONVERT(VARCHAR, CAST(valid_to AS DATETIME2), 103),
    par.payment_terms_id;
END;


/*
JUL-02-2024
*/

CREATE PROCEDURE dbo.DeleteFileById
    @RequestID NVARCHAR(50) -- Define the input parameter for the specified file ID
AS
BEGIN
   
    DELETE FROM dbo.files
    OUTPUT DELETED.id, DELETED.request_id, DELETED.file_name
    WHERE request_id = @RequestID;  -- Use the input parameter
END;
GO


-- EXEC dbo.GetRemarksByRequestIDs ['NR202407020001', 'NR202407020002', 'NR202407020003'];
CREATE PROCEDURE dbo.GetRemarksByRequestIDs
    @RequestIDs NVARCHAR(MAX)  -- Define the input parameter for the specified request IDs
AS
BEGIN

    DECLARE @SQL NVARCHAR(MAX);

    SET @SQL = '
    SELECT DISTINCT
        r.request_id,
        r.id,
        CONCAT(u.employee_name, ''('', u.role, '','', u.employee_id, '')'') AS user_id,
        r.comment,
        CONVERT(VARCHAR, CAST(r.created_at AS DATETIME2), 103) AS created_at
    FROM 
        dbo.Remarks AS r
    INNER JOIN 
        dbo.define_roles AS u ON r.user_id = u.employee_id
    WHERE 
        r.request_id IN (' + @RequestIDs + ')';

    EXEC sp_executesql @SQL;
END;
GO

-- EXEC InsertRemark 'NR202407020001', 12345, 'This is a test comment'
CREATE PROCEDURE dbo.InsertRemark
    @RequestID NVARCHAR(50),
    @UserID NVARCHAR(50),
    @Comment NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.Remarks (request_id, user_id, comment, created_at)
    OUTPUT INSERTED.request_id, INSERTED.user_id, INSERTED.comment, INSERTED.created_at, INSERTED.id
    VALUES (@RequestID, @UserID, @Comment, GETDATE());
END;
GO

-- EXEC GetParentRequestName 'NR202407020003'
CREATE PROCEDURE dbo.GetParentRequestName
    @RequestName NVARCHAR(50)  -- Define the input parameter for the request name
AS
BEGIN

    SELECT parent_request_name
    FROM [PriceApprovalSystem].[dbo].[pre_approved_request_status_mvc]
    WHERE request_name = @RequestName;  -- Use the input parameter
END;
GO


CREATE PROCEDURE dbo.InsertFile
    @RequestId NVARCHAR(50),
    @FileName NVARCHAR(255),
    @FileData VARBINARY(MAX)
AS
BEGIN
    -- Perform the INSERT operation
    INSERT INTO dbo.files (request_id, file_name, file_data)
    OUTPUT INSERTED.request_id, INSERTED.file_name, INSERTED.file_data,INSERTED.id
    VALUES (@RequestId, @FileName, @FileData);
END;
GO


/* JULY 4, 2024 */
    USE [PriceApprovalSystem]
    GO
    /****** Object:  StoredProcedure [dbo].[GetTransactionDetails]    Script Date: 7/4/2024 9:13:40 PM ******/
    SET ANSI_NULLS ON
    GO
    SET QUOTED_IDENTIFIER ON
    GO
    ALTER PROCEDURE [dbo].[GetTransactionDetails]
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
            SET @StatusIM = 'status = ' + CAST(0 AS NVARCHAR(10));
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

/** JULY 5 2024 **/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[GetTransactionDetails]
    @Status INT,
    @Role NVARCHAR(50)
AS
BEGIN
    DECLARE @StatusSTR NVARCHAR(MAX);
    DECLARE @StatusIM NVARCHAR(MAX);

    -- Set @StatusSTR and @StatusIM based on @Status
    IF @Status = 0
    BEGIN
        SET @StatusSTR = 'AND currently_pending_with = @Role';
        SET @StatusIM = 'status = 0';
    END
    ELSE IF @Status = 3 AND @Role = 'RM'
    BEGIN
        SET @StatusSTR = 'AND currently_pending_with = @Role';
        SET @StatusIM = '1=1'; -- No status filter for this case
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
    ) ' + @StatusSTR + '
    UNION
    SELECT *
    FROM transaction_mvc
    WHERE id IN (SELECT maxId FROM MaxDetails) ' + @StatusSTR + ';';

    -- Execute the constructed SQL query
    EXEC sp_executesql @SqlQuery, N'@Role NVARCHAR(50)', @Role;
END;
GO

/*
JUL-8-2024
*/
CREATE PROCEDURE GetTransactionHistory(
    @RequestIds VARCHAR(MAX)
)
AS
BEGIN
    -- Temporary table to hold intermediate results
    DECLARE @TempResults TABLE (
        countTranc INT,
        request_id VARCHAR(50),
        action VARCHAR(50),
        last_updated_by_id VARCHAR(50),
        created_at VARCHAR(50),
        name VARCHAR(50),
        role VARCHAR(50)
    );

    -- Insert data into the temporary table
    INSERT INTO @TempResults (countTranc, request_id, action, last_updated_by_id, created_at, name, role)
    SELECT 
        COUNT(*) AS countTranc,
        t.request_id,
        CASE 
            WHEN t.current_status = 'Approved' THEN 'completelyApproved'
            WHEN t.current_status IN ('Rework', 'Rejected') THEN t.current_status
            ELSE 'Approved'
        END AS action,
        t.last_updated_by_id,
        FORMAT(CONVERT(datetime2, MIN(t.created_at)), 'dd/MM/yyyy h:mm tt') AS created_at,
        d.employee_name AS name,
        d.role
    FROM 
        transaction_mvc t
    JOIN 
        define_roles d ON t.last_updated_by_id = d.employee_id
    WHERE 
        t.request_id IN (SELECT value FROM STRING_SPLIT(@RequestIds, ','))
    GROUP BY 
        t.request_id,
        t.last_updated_by_id,
        t.current_status,
        d.employee_name, 
        d.role;

    -- Select the result from the temporary table
    SELECT 
        countTranc,
        request_id,
        action,
        last_updated_by_id,
        created_at,
        name,
        role
    FROM @TempResults;
END;

/*
JUL-10-2024
*/
CREATE PROCEDURE GetReportsWithDiffTime
AS
BEGIN
    WITH FilteredRequests AS (
        SELECT 
            id, 
            rule_id, 
            currently_pending_with, 
            last_updated_by_role, 
            last_updated_by_id, 
            current_status, 
            request_id, 
            created_at,
            LAG(created_at) OVER (PARTITION BY request_id ORDER BY id) AS previous_created_at,
            LAG(last_updated_by_role) OVER (PARTITION BY request_id ORDER BY id) AS previous_last_updated_by_role,
            CASE 
                WHEN current_status IN ('Rework', 'Rejected') THEN current_status
                ELSE 'Pending'
            END AS action
        FROM 
            transaction_mvc
        WHERE 
            current_status NOT IN ('Approved', 'AM0')
    ),
    TimeDiff AS (
        SELECT 
            id, 
            rule_id, 
            currently_pending_with, 
            last_updated_by_role, 
            last_updated_by_id, 
            current_status, 
            request_id, 
            created_at,
            previous_created_at,
            previous_last_updated_by_role,
            action,
            DATEDIFF(SECOND, previous_created_at, created_at) AS time_diff_seconds,
            ROW_NUMBER() OVER (PARTITION BY request_id, last_updated_by_role ORDER BY id) AS rn
        FROM 
            FilteredRequests
    )
    SELECT 
        request_id AS RequestId, 
        previous_last_updated_by_role AS Role_from, 
        last_updated_by_role AS Role_to, 
        time_diff_seconds AS time
    FROM 
        TimeDiff
    WHERE 
        rn = 1
    ORDER BY 
        id;
END;


/*
11-JUL-2024
*/

CREATE PROCEDURE GetFilesByRequestIds
    @RequestIds NVARCHAR(MAX)
AS
BEGIN
    -- Split the comma-separated request IDs into a table
    DECLARE @RequestIdTable TABLE (RequestId NVARCHAR(50));

    -- Insert each request ID into the table
    INSERT INTO @RequestIdTable (RequestId)
    SELECT value
    FROM STRING_SPLIT(@RequestIds, ',');

    -- Select files where the request_id is in the request ID table
    SELECT * 
    FROM files
    WHERE request_id IN (SELECT RequestId FROM @RequestIdTable);
END
GO