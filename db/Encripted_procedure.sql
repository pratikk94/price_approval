-- EXEC InsertRemark 'NR202407020001', 12345, 'This is a test comment'
CREATE PROCEDURE dbo.InsertRemark
    @RequestID NVARCHAR(50),
    @UserID NVARCHAR(50),
    @Comment NVARCHAR(MAX),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Input Validation
        IF LEN(@RequestID) = 0 OR LEN(@UserID) = 0 OR LEN(@Comment) = 0
        BEGIN
            RAISERROR('Invalid input parameters', 16, 1);
            RETURN;
        END

        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);
        
        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for encryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Insert the encrypted values into the Remarks table and return the inserted values
        INSERT INTO dbo.Remarks (request_id, user_id, comment, created_at)
        OUTPUT 
            INSERTED.request_id, 
            INSERTED.user_id, 
            INSERTED.comment, 
            INSERTED.created_at, 
            INSERTED.id
        VALUES 
        (
            EncryptByKey(@KeyGUID, @RequestID), 
            EncryptByKey(@KeyGUID, @UserID), 
            EncryptByKey(@KeyGUID, @Comment), 
            GETDATE() -- No encryption applied to GETDATE() as it is a datetime type
        );

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- DECLARE @RequestIDs NVARCHAR(MAX) = '''NR202407190005'',''NR202407210001''';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC dbo.GetRemarksByRequestIDs @RequestIDs, @SymmetricKeyName, @CertificateName;

CREATE PROCEDURE dbo.GetRemarksByRequestIDs
    @RequestIDs NVARCHAR(MAX),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SQL NVARCHAR(MAX);

    BEGIN TRY
        -- Open the symmetric key for decryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Select the decrypted values
        SET @SQL = '
        SELECT DISTINCT
            CONVERT(NVARCHAR(50), DecryptByKey(r.request_id)) AS request_id,
            r.id,
            CONCAT(u.employee_name, ''('', u.role, '','', u.employee_id, '')'') AS user_id,
            CONVERT(NVARCHAR(MAX), DecryptByKey(r.comment)) AS comment,
            CONVERT(VARCHAR, CAST(r.created_at AS DATETIME2), 103) AS created_at
        FROM 
            dbo.Remarks AS r
        INNER JOIN 
            dbo.define_roles AS u ON CONVERT(NVARCHAR(50), DecryptByKey(r.user_id)) = u.employee_id
        WHERE 
            CONVERT(NVARCHAR(50), DecryptByKey(r.request_id)) IN (' + @RequestIDs + ')
        ';
        
        EXEC sp_executesql @SQL;

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO



/*
payment_terms_master
*/

ALTER TABLE [PriceApprovalSystem].[dbo].[payment_terms_master]
ALTER COLUMN customer_id varbinary(128);

ALTER TABLE [PriceApprovalSystem].[dbo].[payment_terms_master]
ALTER COLUMN consignee_id varbinary(128);

ALTER TABLE [PriceApprovalSystem].[dbo].[payment_terms_master]
ALTER COLUMN end_use_id varbinary(128);

ALTER TABLE [PriceApprovalSystem].[dbo].[payment_terms_master]
ALTER COLUMN payment_term_id varbinary(128);


-- Step 1: Open Symmetric Key
OPEN SYMMETRIC KEY YourSymmetricKeyName
DECRYPTION BY CERTIFICATE YourCertificateName;

-- Step 3: Insert Data with Encryption
INSERT INTO [PriceApprovalSystem].[dbo].[payment_terms_master]
    (id, customer_id, consignee_id, end_use_id, payment_term_id, valid_from, valid_to, status)
VALUES
    (6, EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(68 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(7 AS VARBINARY(16))),
        '2024-01-01T00:00:00', '2023-12-31T23:59:59', 1),
    
    (7, EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(25 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(6 AS VARBINARY(16))),
        '2024-01-01T00:00:00', '2025-12-31T23:59:59', 1),
    
    (8, EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(68 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(26 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(87 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(8 AS VARBINARY(16))),
        '2024-01-01T00:00:00', '2025-12-31T23:59:59', 1),
    
    (9, EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(41 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(3 AS VARBINARY(16))),
        '2024-01-01T00:00:00', '2025-12-31T23:59:59', 1),
    
    (10, EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(68 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(41 AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(NULL AS VARBINARY(16))),
        EncryptByKey(Key_GUID('YourSymmetricKeyName'), CAST(6 AS VARBINARY(16))),
        '2024-01-01T00:00:00', '2025-12-31T23:59:59', 1);

-- Step 4: Close Symmetric Key
CLOSE SYMMETRIC KEY YourSymmetricKeyName;


-- Step 1: Open Symmetric Key
OPEN SYMMETRIC KEY YourSymmetricKeyName
DECRYPTION BY CERTIFICATE YourCertificateName;

-- Step 2: Select and Decrypt Data
SELECT
    id,
    CAST(DecryptByKey(customer_id) AS INT) AS customer_id,
    CAST(DecryptByKey(consignee_id) AS INT) AS consignee_id,
    CAST(DecryptByKey(end_use_id) AS INT) AS end_use_id,
    CAST(DecryptByKey(payment_term_id) AS INT) AS payment_term_id,
    valid_from,
    valid_to,
    status
FROM
    [PriceApprovalSystem].[dbo].[payment_terms_master];

-- Step 3: Close Symmetric Key
CLOSE SYMMETRIC KEY YourSymmetricKeyName;


/*
InsertEmployeeRole
*/
CREATE PROCEDURE InsertEmployeeRole
    @employee_id VARCHAR(255),
    @employee_name VARCHAR(255),
    @role VARCHAR(100),
    @region VARCHAR(100),
    @created_by VARCHAR(255),
    @created_date DATETIME,
    @active INT,
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Input Validation
        IF LEN(@employee_id) = 0 OR LEN(@employee_name) = 0 OR LEN(@role) = 0 OR LEN(@region) = 0
        BEGIN
            RAISERROR('Invalid input parameters', 16, 1);
            RETURN;
        END

        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);
        
        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for encryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Insert the encrypted values into the define_roles table and return the inserted values
        INSERT INTO define_roles (employee_id, employee_name, role, region, created_by, created_date, active) 
        OUTPUT INSERTED.*
        VALUES 
        (
            @employee_id, 
            EncryptByKey(@KeyGUID, @employee_name), 
            EncryptByKey(@KeyGUID, @role), 
            EncryptByKey(@KeyGUID, @region), 
            @created_by, 
            @created_date, 
            @active
        );

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- EXEC FetchUserByEmployeeId
--     @employee_id = @employee_id,
--     @SymmetricKeyName = @SymmetricKeyName,
--     @CertificateName = @CertificateName;
CREATE PROCEDURE FetchUserByEmployeeId
    @employee_id VARCHAR(255),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);

        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for decryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Decrypt and select the values from the define_roles table where employee_id matches
        SELECT 
            employee_id,
            CONVERT(VARCHAR(255), DecryptByKey(employee_name)) AS employee_name,
            CONVERT(VARCHAR(100), DecryptByKey(role)) AS role,
            CONVERT(VARCHAR(100), DecryptByKey(region)) AS region,
            created_by,
            created_date,
            active
        FROM 
            define_roles
        WHERE
            employee_id = @employee_id;

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- DECLARE @role NVARCHAR(255) = ''; -- Replace with the role you're searching for
-- DECLARE @region NVARCHAR(255) = ''; -- Replace with the region you're searching for
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName'; -- Replace with your symmetric key name
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName'; -- Replace with your certificate name

-- EXEC SearchDefineRoles 
--     @role = @role, 
--     @region = @region, 
--     @SymmetricKeyName = @SymmetricKeyName, 
--     @CertificateName = @CertificateName;
CREATE PROCEDURE SearchDefineRoles
    @role NVARCHAR(255) = '',
    @region NVARCHAR(255) = '',
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);

        -- Set default values for role and region if they are empty
        IF @role = '' SET @role = '%';
        IF @region = '' SET @region = '%';

        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for decryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Decrypt and select the values from the define_roles table where role and region match
        SELECT 
            employee_id,
            CONVERT(VARCHAR(255), DecryptByKey(employee_name)) AS employee_name,
            CONVERT(VARCHAR(100), DecryptByKey(role)) AS role,
            CONVERT(VARCHAR(100), DecryptByKey(region)) AS region,
            created_by,
            created_date,
            active
        FROM 
            define_roles
        WHERE
            CONVERT(NVARCHAR(255), DecryptByKey(role)) LIKE @role AND CONVERT(NVARCHAR(255), DecryptByKey(region)) LIKE @region;

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- -- Declare variables for parameters
-- DECLARE @id INT = 1022; -- Replace with the ID of the role you want to fetch
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName'; -- Replace with your symmetric key name
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName'; -- Replace with your certificate name

-- -- Execute the stored procedure
-- EXEC FetchDefinedRoleById 
--     @id = @id, 
--     @SymmetricKeyName = @SymmetricKeyName, 
--     @CertificateName = @CertificateName;
CREATE PROCEDURE FetchDefinedRoleById
    @id INT,
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);

        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for decryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Decrypt and select the values from the define_roles table where id matches
        SELECT 
            id,
            employee_id,
            CONVERT(VARCHAR(255), DecryptByKey(employee_name)) AS employee_name,
            CONVERT(VARCHAR(100), DecryptByKey(role)) AS role,
            CONVERT(VARCHAR(100), DecryptByKey(region)) AS region,
            created_by,
            created_date,
            active
        FROM 
            define_roles
        WHERE 
            id = @id;

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- -- Declare variables for parameters
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName'; -- Replace with your symmetric key name
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName'; -- Replace with your certificate name

-- -- Execute the stored procedure
-- EXEC FetchRulesDecrypted 
--     @SymmetricKeyName = @SymmetricKeyName, 
--     @CertificateName = @CertificateName;


CREATE PROCEDURE FetchRules
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DECLARE @KeyGUID UNIQUEIDENTIFIER;
        DECLARE @SQL NVARCHAR(MAX);

        -- Get the GUID of the symmetric key
        SELECT @KeyGUID = Key_GUID(@SymmetricKeyName);

        -- Open the symmetric key for decryption
        SET @SQL = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName);
        EXEC sp_executesql @SQL;

        -- Select rules and decrypted approver names
        SELECT 
            r.*,
            STRING_AGG(CONVERT(VARCHAR(255), DecryptByKey(dr.employee_name)), ', ') AS approver_names
        FROM 
            rules r
        CROSS APPLY 
            STRING_SPLIT(REPLACE(REPLACE(r.approvers, '[', ''), ']', ''), ',') AS s
        JOIN 
            define_roles dr ON dr.employee_id = s.value
        WHERE 
            r.status = 1
        GROUP BY 
            r.name, r.id, r.region, r.profit_center, r.valid_from, r.valid_to, r.approvers, r.status, r.created_by, r.created_date;

        -- Close the symmetric key
        SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
        EXEC sp_executesql @SQL;
    END TRY
    BEGIN CATCH
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000), @ErrorSeverity INT, @ErrorState INT;
        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        -- Close the symmetric key in case of an error
        BEGIN TRY
            SET @SQL = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName);
            EXEC sp_executesql @SQL;
        END TRY
        BEGIN CATCH
            -- Ignore errors during key closing, as we are already handling another error
        END CATCH;

        -- Rethrow the original error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO