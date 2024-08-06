-- EXEC GetPriceRequestByStatus @StatusFilter = 'RM', @SymmetricKeyName = 'YourSymmetricKeyName', @CertificateName = 'YourCertificateName';

CREATE PROCEDURE GetPriceRequestByStatus
    @StatusFilter VARCHAR(128) = NULL,
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select distinct records with decrypted fields and filter by decrypted current_status
        SELECT DISTINCT
            CAST(REPLACE(DecryptByKey(t.request_id), CHAR(0), '') AS VARCHAR(128)) AS request_id
        FROM transaction_mvc t
      WHERE (@StatusFilter IS NULL 
    OR CAST(DecryptByKey(t.current_status) AS VARCHAR(128)) LIKE '%' + @StatusFilter + '%');



        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END
        
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
        
        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;



-- DECLARE @RuleId NVARCHAR(128) = 1;
-- DECLARE @LastUpdatedByRole NVARCHAR(128) = 'AM';
-- DECLARE @LastUpdatedById NVARCHAR(128) = 'e1001';
-- DECLARE @RequestId NVARCHAR(128) = 'NR202407050001';
-- DECLARE @CurrentStatus NVARCHAR(128) = 'AM0';
-- DECLARE @CurrentlyPendingWith NVARCHAR(128) = 'AM';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC InsertTransaction 
--     @RuleId, 
--     @LastUpdatedByRole, 
--     @LastUpdatedById, 
--     @RequestId, 
--     @CurrentStatus, 
--     @CurrentlyPendingWith,
--     @SymmetricKeyName,
--     @CertificateName;

CREATE PROCEDURE InsertTransaction
    @RuleId BIGINT,
    @LastUpdatedByRole NVARCHAR(128),
    @LastUpdatedById NVARCHAR(128),
    @RequestId NVARCHAR(128),
    @CurrentStatus NVARCHAR(128),
    @CurrentlyPendingWith NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for encryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Insert the encrypted values into the table
        INSERT INTO transaction_mvc (
            rule_id, last_updated_by_role, last_updated_by_id, request_id, current_status, currently_pending_with
        )
        OUTPUT INSERTED.*
        VALUES (
            @RuleId,
            EncryptByKey(Key_GUID(@SymmetricKeyName), @LastUpdatedByRole),
            EncryptByKey(Key_GUID(@SymmetricKeyName), @LastUpdatedById),
            EncryptByKey(Key_GUID(@SymmetricKeyName), @RequestId),
            EncryptByKey(Key_GUID(@SymmetricKeyName), @CurrentStatus),
            EncryptByKey(Key_GUID(@SymmetricKeyName), @CurrentlyPendingWith)
        );

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO


-- DECLARE @PendingWith NVARCHAR(128) = 'AM';
-- DECLARE @Approver NVARCHAR(128) = 'AM';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetTransactionByRole 
--     @PendingWith, 
--     @Approver, 
--     @SymmetricKeyName, 
--     @CertificateName;


CREATE PROCEDURE GetTransactionByRole
    @PendingWith NVARCHAR(128),
    @Approver NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select and decrypt the necessary columns
        SELECT 
            t.id,
            t.rule_id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with), CHAR(0), '') AS NVARCHAR(128)) AS currently_pending_with,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_role), CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_role,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_id), CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_id,
            CAST(REPLACE(DecryptByKey(t.current_status), CHAR(0), '') AS NVARCHAR(128)) AS current_status,
            CAST(REPLACE(DecryptByKey(t.request_id), CHAR(0), '') AS NVARCHAR(128)) AS request_id,
            t.created_at
        FROM transaction_mvc t
        WHERE 
            CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)) = @PendingWith
            AND CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_role)) = @Approver;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO

-- DECLARE @Role NVARCHAR(128) = 'AM';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetTransactionPendingWithRole 
--     @Role, 
--     @SymmetricKeyName, 
--     @CertificateName;

CREATE PROCEDURE GetTransactionPendingWithRole
    @Role NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select and decrypt the necessary columns
        SELECT 
            t.id,
            t.rule_id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with),CHAR(0), '') AS NVARCHAR(128)) AS currently_pending_with,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_role),CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_role,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_id),CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_id,
            CAST(REPLACE(DecryptByKey(t.current_status),CHAR(0), '' )AS NVARCHAR(128)) AS current_status,
            CAST(REPLACE(DecryptByKey(t.request_id),CHAR(0), '') AS NVARCHAR(128)) AS request_id,
            t.created_at
        FROM transaction_mvc t
        WHERE 
            CAST(DecryptByKey(t.currently_pending_with) AS NVARCHAR(128)) = @Role;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO

-- DECLARE @RequestId NVARCHAR(128) = 'NR202407050001';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetLatestTransactionByRequestId 
--     @RequestId, 
--     @SymmetricKeyName, 
--     @CertificateName;

CREATE PROCEDURE GetLatestTransactionByRequestId
    @RequestId NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select the latest record and decrypt the necessary columns
        SELECT TOP 1
            t.id,
            t.rule_id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with),CHAR(0), '') AS NVARCHAR(128)) AS currently_pending_with,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_role),CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_role,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_id),CHAR(0), '') AS NVARCHAR(128)) AS last_updated_by_id,
            CAST(REPLACE(DecryptByKey(t.current_status),CHAR(0), '' )AS NVARCHAR(128)) AS current_status,
            CAST(REPLACE(DecryptByKey(t.request_id),CHAR(0), '') AS NVARCHAR(128)) AS request_id,
            t.created_at
        FROM transaction_mvc t
        WHERE 
            CONVERT(VARCHAR(128), DecryptByKey(t.request_id)) = @RequestId
        ORDER BY t.id DESC;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO

-- DECLARE @RequestId NVARCHAR(128) = 'request_id_value';
-- DECLARE @OldRequestId NVARCHAR(128) = 'old_request_id_value';
-- DECLARE @LastUpdatedByRole NVARCHAR(128) = 'role_value';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetLatestTransactionByRequestIdAndRole 
--     @RequestId, 
--     @OldRequestId, 
--     @LastUpdatedByRole, 
--     @SymmetricKeyName, 
--     @CertificateName;

CREATE PROCEDURE GetLatestTransactionByRequestIdAndRole
    @RequestId NVARCHAR(128),
    @OldRequestId NVARCHAR(128),
    @LastUpdatedByRole NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select the latest record and decrypt the necessary columns
        DECLARE @EffectiveRequestId NVARCHAR(128) = CASE WHEN LEN(@OldRequestId) > 0 THEN @OldRequestId ELSE @RequestId END;

        SELECT TOP 1
            t.id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with), CHAR(0), '') AS NVARCHAR(128)) AS currently_pending_with,
            t.rule_id
        FROM transaction_mvc t
        WHERE 
            CONVERT(VARCHAR(128), DecryptByKey(t.request_id)) = @EffectiveRequestId
            AND CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)) = @LastUpdatedByRole
        ORDER BY t.id DESC;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO

-- DECLARE @OldRequestId NVARCHAR(128) = 'NR202407050001';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetLatestTransactionByOldRequestId 
--     @OldRequestId, 
--     @SymmetricKeyName, 
--     @CertificateName;

CREATE PROCEDURE GetLatestTransactionByOldRequestId
    @OldRequestId NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select the latest record and decrypt the necessary columns
        SELECT TOP 1
            t.id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with), CHAR(0), '') AS NVARCHAR(128)) AS currently_pending_with,
            t.rule_id
        FROM transaction_mvc t
        WHERE 
            CONVERT(VARCHAR(128), DecryptByKey(t.request_id)) = @OldRequestId
        ORDER BY t.id DESC;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO


-- DECLARE @Role NVARCHAR(128) = 'AM';
-- DECLARE @Region NVARCHAR(128) = 'Sales office North';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetLatestTransactionByRoleAndRegion 
--     @Role, 
--     @Region, 
--     @SymmetricKeyName, 
--     @CertificateName;

CREATE PROCEDURE GetLatestTransactionByRoleAndRegion
    @Role NVARCHAR(128),
    @Region NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Select the latest record and decrypt the necessary columns
        SELECT TOP 1
            t.id,
            CAST(REPLACE(DecryptByKey(t.request_id), CHAR(0), '') AS NVARCHAR(128)) AS request_id
        FROM transaction_mvc t
        INNER JOIN rule_mvc r ON t.rule_id = r.rule_id
        WHERE 
            CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)) = @Role
            AND r.region = @Region
        ORDER BY CONVERT(VARCHAR(128), DecryptByKey(t.created_at)) DESC;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO

-- DECLARE @Status INT = 0;
-- DECLARE @Role NVARCHAR(50) = 'AM';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetTransactionDetails 
--     @Status, 
--     @Role, 
--     @SymmetricKeyName, 
--     @CertificateName;

-- DROP PROCEDURE GetTransactionDetails

CREATE PROCEDURE GetTransactionDetails
    @Status INT,
    @Role NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Declare dynamic SQL strings for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Declare variables to hold dynamic SQL for the query
        DECLARE @StatusSTR NVARCHAR(MAX);
        DECLARE @StatusIM NVARCHAR(MAX);

        -- Set @StatusSTR and @StatusIM based on @Status
        IF @Status = 0
        BEGIN
            SET @StatusSTR = 'AND CAST(REPLACE(DecryptByKey(currently_pending_with), CHAR(0), '''') AS VARCHAR(128)) = @Role';
            SET @StatusIM = 'status = 0';
        END
        ELSE IF @Status = 3 AND @Role = 'RM'
        BEGIN
            SET @StatusSTR = 'AND CAST(REPLACE(DecryptByKey(currently_pending_with), CHAR(0), '''') AS VARCHAR(128)) = @Role';
            SET @StatusIM = '1=1';  -- No status filter for this case
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
            SELECT MAX(id) AS maxId, CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(request_id)), CHAR(0), '''') AS VARCHAR(128)) AS request_id
            FROM transaction_mvc
            WHERE CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(request_id)), CHAR(0), '''') AS VARCHAR(128)) IN (SELECT req_id FROM FilteredRequests)
            GROUP BY CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(request_id)), CHAR(0), '''') AS VARCHAR(128))
        ),
        MaxDetails AS (
           SELECT m.maxId, m.request_id, CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.current_status)), CHAR(0), '''') AS VARCHAR(128)) AS current_status
            FROM transaction_mvc t
            INNER JOIN MaxIds m ON t.id = m.maxId
        ),
        RelatedTransactions AS (
           SELECT 
               t.id,
               t.rule_id,
               CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)), CHAR(0), '''') AS VARCHAR(128)) AS currently_pending_with,
               CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_role)), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_role,
               CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_id)), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_id,
               CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.current_status)), CHAR(0), '''') AS VARCHAR(128)) AS current_status,
               CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.request_id)), CHAR(0), '''') AS VARCHAR(128)) AS request_id,
               t.created_at
            FROM transaction_mvc t
            INNER JOIN MaxDetails m ON CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.request_id)), CHAR(0), '''') AS VARCHAR(128)) = m.request_id 
            AND CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.current_status)), CHAR(0), '''') AS VARCHAR(128)) = m.current_status
        )
        SELECT *
        FROM RelatedTransactions
        WHERE EXISTS (
            SELECT 1
            FROM transaction_mvc
            WHERE CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(request_id)), CHAR(0), '''') AS VARCHAR(128)) = RelatedTransactions.request_id
            AND CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(current_status)), CHAR(0), '''') AS VARCHAR(128)) = RelatedTransactions.current_status
            AND id != RelatedTransactions.id
        ) 
        ' + @StatusSTR + '
        UNION
        SELECT 
          t.id,
          t.rule_id,
          CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)), CHAR(0), '''') AS VARCHAR(128)) AS currently_pending_with,
          CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_role)), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_role,
          CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_id)), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_id,
          CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.current_status)), CHAR(0), '''') AS VARCHAR(128)) AS current_status,
          CAST(REPLACE(CONVERT(VARCHAR(128), DecryptByKey(t.request_id)), CHAR(0), '''') AS VARCHAR(128)) AS request_id,
          t.created_at
        FROM transaction_mvc t
        WHERE id IN (SELECT maxId FROM MaxDetails) ' + @StatusSTR + ';';

        -- Execute the constructed SQL query
        EXEC sp_executesql @SqlQuery, N'@Role NVARCHAR(50)', @Role;

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO


-- EXEC GetPriceApprovalRequests @Id = 'e1002', @Status = '0', @RequestId = NR202407300003, @Role = 'RM', @SymmetricKeyName = 'YourSymmetricKeyName', @CertificateName='YourCertificateName'
EXEC GetPriceApprovalRequests @Id = 'e1002', @Status = '0',
 @RequestId = NR202408050001, @Role = 'RM',
 @SymmetricKeyName = 'YourSymmetricKeyName', 
 @CertificateName='YourCertificateName'

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[GetPriceApprovalRequests]
    @RequestID NVARCHAR(50),
    @Status INT,
    @Id NVARCHAR(50),
    @Role NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Declare dynamic SQL strings for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;
    DECLARE @MaxStatus INT;

SELECT @MaxStatus = MAX(status)
    FROM [PriceApprovalSystem].[dbo].[requests_mvc]
    WHERE req_id = @RequestID;

-- If the status parameter is not equal to the maximum status, return an empty result set
IF @Status <> @MaxStatus
BEGIN
        SELECT
            NULL AS request_name,
            NULL AS customer_name,
            NULL AS customer_ids,
            NULL AS consignee_name,
            NULL AS consignee_ids,
            NULL AS enduse_name,
            NULL AS end_use_id,
            NULL AS plant,
            NULL AS valid_from,
            NULL AS valid_to,
            NULL AS payment_terms_id
        WHERE 1 = 0;
    -- This will return an empty result set
    END
ELSE
BEGIN
        -- Use a CTE to fetch the latest status for the request ID
        WITH
            LatestStatus
            AS
            (
                SELECT TOP (1)
                    req_id,
                    status
                FROM
                    [PriceApprovalSystem].[dbo].[requests_mvc]
                WHERE 
            req_id = @RequestID
                ORDER BY 
            id DESC
                -- Assuming id is a sequential identifier for ordering
            )

        SELECT
            rm.parent_request_id as request_name,
            CONVERT(NVARCHAR(50), DECRYPTBYKEY(c.name)) AS customer_name,
            CONVERT(VARCHAR(128), DecryptByKey(par.customer_id)) AS customer_ids,
            consignee.name AS consignee_name,
            CONVERT(VARCHAR(128), DecryptByKey(par.consignee_id)) AS consignee_ids,
            enduse.name AS enduse_name,
            par.end_use_id,
            par.plant,
            CONVERT(VARCHAR, CAST(par.valid_from AS DATETIME), 103) AS valid_from,
            CONVERT(VARCHAR, CAST(par.valid_to AS DATETIME), 103) AS valid_to,
            par.payment_terms_id,
            par.mappint_type

        FROM
            price_approval_requests par
            LEFT JOIN
            customer c ON par.customer_id = c.id
            LEFT JOIN
            customer consignee ON par.consignee_id = consignee.id
            LEFT JOIN
            customer enduse ON par.end_use_id = enduse.id
            JOIN
            LatestStatus ls ON par.request_name = ls.req_id
            JOIN
            requests_mvc rs ON par.request_name = rs.req_id
            JOIN
            transaction_mvc tmvc ON par.request_name = CONVERT(VARCHAR(128), DecryptByKey(tmvc.request_id))
            INNER JOIN
            price_approval_requests_price_table parpt ON par.request_name = CAST(REPLACE(DecryptByKey(parpt.req_id), CHAR(0), '') AS NVARCHAR(128))
            INNER JOIN
            profit_center PC ON CAST(REPLACE(DecryptByKey(parpt.grade), CHAR(0), '') AS NVARCHAR(50)) = PC.Grade
            INNER JOIN
            business_admin_variables BAV ON BAV.value = LEFT(CAST(ABS(PC.Profit_Centre) AS VARCHAR(10)), 1)
            JOIN
            define_roles dr ON CONVERT(VARCHAR(128), DecryptByKey(tmvc.last_updated_by_id)) = dr.employee_id
            INNER JOIN
            request_mapper rm ON rm.request_id = par.request_name
        WHERE 
        par.request_name = @RequestID
            AND BAV.[key] = @Role
            AND dr.region IN (SELECT region
            FROM [PriceApprovalSystem].[dbo].[define_roles]
            WHERE employee_id = @Id)
            AND rs.status = @Status -- Filter based on the parameterized status
            AND ls.status = (SELECT TOP 1
                status
            FROM LatestStatus
            ORDER BY req_id DESC) -- Ensure matching latest status
            AND @Status <= @MaxStatus;
    -- Ensure @Status is within valid range
    END

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        -- Retrieve error information
        SELECT
        @ErrorMessage = ERROR_MESSAGE(),
        @ErrorSeverity = ERROR_SEVERITY(),
        @ErrorState = ERROR_STATE();

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT *
    FROM sys.openkeys
    WHERE key_name = @SymmetricKeyName)
        BEGIN
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END

        -- Raise the error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- EXEC GetPriceApprovalRequestsHigh  @Status = '${status}', @RequestId = ${transaction.request_id}, @Role = '${role},@SymmetricKeyName = ${SYMMETRIC_KEY_NAME}, @CertificateName=${CERTIFICATE_NAME}

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[GetPriceApprovalRequestsHigh]
    @RequestID NVARCHAR(50),
    @Status INT,
    @Role NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
    -- @Id INT
AS
BEGIN
   BEGIN TRY
        -- Declare dynamic SQL strings for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for decryption
        EXEC sp_executesql @OpenSymmetricKeySQL;
    DECLARE @MaxStatus INT;

SELECT @MaxStatus = MAX(status)
FROM [PriceApprovalSystem].[dbo].[requests_mvc]
WHERE req_id = @RequestID;

-- If the status parameter is not equal to the maximum status, return an empty result set
IF @Status <> @MaxStatus
BEGIN
    SELECT 
        NULL AS request_name,
        NULL AS customer_name,
        NULL AS customer_ids,
        NULL AS consignee_name,
        NULL AS consignee_ids,
        NULL AS enduse_name,
        NULL AS end_use_id,
        NULL AS plant,
        NULL AS valid_from,
        NULL AS valid_to,
        NULL AS payment_terms_id
    WHERE 1 = 0; -- This will return an empty result set
END
ELSE
BEGIN
    -- Use a CTE to fetch the latest status for the request ID
    WITH LatestStatus AS (
        SELECT TOP (1) 
            req_id,
            status
        FROM 
            [PriceApprovalSystem].[dbo].[requests_mvc]
        WHERE 
            req_id = @RequestID
        ORDER BY 
            id DESC -- Assuming id is a sequential identifier for ordering
    )
    
    SELECT 
        rm.parent_request_id as request_name,
        c.name AS customer_name, 
        par.customer_id AS customer_ids,
        consignee.name AS consignee_name, 
        par.consignee_id AS consignee_ids,
        enduse.name AS enduse_name,
        par.end_use_id,
        par.plant,
        CONVERT(VARCHAR, CAST(par.valid_from AS DATETIME), 103) AS valid_from,
        CONVERT(VARCHAR, CAST(par.valid_to AS DATETIME), 103) AS valid_to,
        par.payment_terms_id,
        par.mappint_type
    FROM 
        price_approval_requests par
    LEFT JOIN 
        customer c ON par.customer_id = c.id
    LEFT JOIN 
        customer consignee ON par.consignee_id = consignee.id
    LEFT JOIN 
        customer enduse ON par.end_use_id = enduse.id
    JOIN 
        LatestStatus ls ON par.request_name = ls.req_id
    JOIN 
        requests_mvc rs ON par.request_name = rs.req_id
    JOIN 
        transaction_mvc tmvc ON par.request_name = tmvc.request_id
    INNER JOIN 
        price_approval_requests_price_table parpt ON par.request_name = parpt.req_id
    INNER JOIN 
        profit_center PC ON parpt.grade = PC.Grade
    INNER JOIN 
        business_admin_variables BAV ON BAV.value = LEFT(CAST(ABS(PC.Profit_Centre) AS VARCHAR(10)), 1)
    INNER JOIN
        request_mapper rm ON rm.request_id = par.request_name 
    -- JOIN 
    --     define_roles dr ON tmvc.last_updated_by_id = dr.employee_id
    WHERE 
        par.request_name = @RequestID
        AND BAV.[key] = @Role
        -- AND dr.region IN (SELECT region FROM [PriceApprovalSystem].[dbo].[define_roles] WHERE employee_id = @Id)
        AND rs.status = @Status -- Filter based on the parameterized status
        AND ls.status = (SELECT TOP 1 status FROM LatestStatus ORDER BY par.req_id DESC) -- Ensure matching latest status
        AND @Status <= @MaxStatus; -- Ensure @Status is within valid range
    END

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        -- Declare variables to hold error information
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        -- Retrieve error information
        SELECT
        @ErrorMessage = ERROR_MESSAGE(),
        @ErrorSeverity = ERROR_SEVERITY(),
        @ErrorState = ERROR_STATE();

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT *
    FROM sys.openkeys
    WHERE key_name = @SymmetricKeyName)
        BEGIN
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END

        -- Raise the error
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;
GO


-- EXEC FetchRequests 
--     @grade = 'BXHS',
--     @customerIdsArray = '14,8', 
--     @consigneeIdsArray = '4,3', 
--     @plantIdsArray = '1,3,4', 
--     @endUseId = 'seg1',
--     @SymmetricKeyName = 'YourSymmetricKeyName',
--     @CertificateName = 'YourCertificateName';


CREATE PROCEDURE FetchRequests
    @grade NVARCHAR(50),
    @customerIdsArray NVARCHAR(MAX) = NULL,
    @consigneeIdsArray NVARCHAR(MAX) = NULL,
    @plantIdsArray NVARCHAR(MAX) = NULL,
    @endUseId NVARCHAR(50) = NULL,
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for decryption
        DECLARE @sql NVARCHAR(MAX)
        SET @sql = 'OPEN SYMMETRIC KEY ' + @SymmetricKeyName + ' DECRYPTION BY CERTIFICATE ' + @CertificateName;
        EXEC sp_executesql @sql;

        -- Base query with decryption
        DECLARE @query NVARCHAR(MAX) = 
            'SELECT DISTINCT 
                requests_mvc.req_id, 
        requests_mvc.*, 
        -- Decrypting each column in the price_approval_requests_price_table table
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.req_id) AS VARCHAR(128)) AS req_id,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.grade) AS VARCHAR(50)) AS grade,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.fsc) AS VARCHAR(50)) AS fsc,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.grade_type) AS VARCHAR(50)) AS grade_type,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.gsm_range_from) AS VARCHAR(MAX)) AS gsm_range_from,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.gsm_range_to) AS VARCHAR(MAX)) AS gsm_range_to,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.agreed_price) AS VARCHAR(MAX)) AS agreed_price,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.special_discount) AS VARCHAR(MAX)) AS special_discount,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.reel_discount) AS VARCHAR(MAX)) AS reel_discount,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.pack_upcharge) AS VARCHAR(MAX)) AS pack_upcharge,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.tpc) AS VARCHAR(MAX)) AS tpc,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.offline_discount) AS VARCHAR(MAX)) AS offline_discount,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.net_nsr) AS VARCHAR(MAX)) AS net_nsr,
        CAST(DECRYPTBYKEY(price_approval_requests_price_table.old_net_nsr) AS VARCHAR(MAX)) AS old_net_nsr
             FROM price_approval_requests_price_table
             INNER JOIN requests_mvc ON 
                CAST(DECRYPTBYKEY(price_approval_requests_price_table.req_id) AS VARCHAR(128)) = requests_mvc.req_id
             WHERE 
                CAST(DECRYPTBYKEY(price_approval_requests_price_table.grade) AS VARCHAR(50)) = @grade
               AND requests_mvc.status = 0
               AND requests_mvc.req_id IN (
                   SELECT DISTINCT request_name 
                   FROM price_approval_requests 
                   WHERE 1=1 ';

        -- Dynamically add conditions
        IF @customerIdsArray IS NOT NULL AND LEN(@customerIdsArray) > 0
        BEGIN
            SET @query += ' AND customer_id IN (' + @customerIdsArray + ')';
        END

        IF @consigneeIdsArray IS NOT NULL AND LEN(@consigneeIdsArray) > 0
        BEGIN
            SET @query += ' AND consignee_id IN (' + @consigneeIdsArray + ')';
        END

        IF @plantIdsArray IS NOT NULL AND LEN(@plantIdsArray) > 0
        BEGIN
            SET @query += ' AND plant IN (' + @plantIdsArray + ')';
        END

        IF @endUseId IS NOT NULL AND LEN(@endUseId) > 0
        BEGIN
            SET @query += ' AND end_use_id = ''' + @endUseId + '''';
        END

        -- Closing the IN clause and the main query
        SET @query += ' )';
PRINT 'Debug: Final SQL Query - ' + @query;
        -- Execute the dynamic query
        EXEC sp_executesql @query, N'@grade NVARCHAR(50)', @grade;

        -- Close the symmetric key after the operation
        SET @sql = 'CLOSE SYMMETRIC KEY ' + @SymmetricKeyName;
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Handle errors
        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END;


-- EXEC InsertPriceApprovalRequest 
--     @req_id ,@fsc,@grade,@grade_type,@gsm_range_from,@gsm_range_to,
--     @agreed_price,@special_discount,@reel_discount, @pack_upcharge,
--     @tpc,@offline_discount,@net_nsr,@old_net_nsr,@SymmetricKeyName,
--     @CertificateName;

CREATE PROCEDURE InsertPriceApprovalRequest
    @req_id NVARCHAR(128),
    @fsc NVARCHAR(50),
    @grade NVARCHAR(50),
    @grade_type NVARCHAR(50),
    @gsm_range_from NVARCHAR(50),
    @gsm_range_to NVARCHAR(50),
    @agreed_price NVARCHAR(50),
    @special_discount NVARCHAR(50),
    @reel_discount NVARCHAR(50),
    @pack_upcharge NVARCHAR(50),
    @tpc NVARCHAR(50),
    @offline_discount NVARCHAR(50),
    @net_nsr NVARCHAR(50),
    @old_net_nsr NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for encryption
        DECLARE @sql NVARCHAR(MAX)
        SET @sql = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';
        EXEC sp_executesql @sql;

        -- Insert data with encryption
        INSERT INTO price_approval_requests_price_table 
            (req_id, fsc, grade, grade_type, gsm_range_from, gsm_range_to, agreed_price, special_discount, 
            reel_discount, pack_upcharge, tpc, offline_discount, net_nsr, old_net_nsr) 
        OUTPUT INSERTED.*
        VALUES 
            (EncryptByKey(Key_GUID(@SymmetricKeyName), @req_id),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @fsc),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @grade),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @grade_type),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @gsm_range_from),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @gsm_range_to),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @agreed_price),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @special_discount),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @reel_discount),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @pack_upcharge),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @tpc),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @offline_discount),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @net_nsr),
             EncryptByKey(Key_GUID(@SymmetricKeyName), @old_net_nsr)
            );

        -- Close the symmetric key
        SET @sql = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        RETURN;
    END CATCH
END;


-- EXEC GetLatestPriceApprovalRequest 
--     @requestId = 'NR202408020001',
--     @SymmetricKeyName = 'YourSymmetricKeyName',
--     @CertificateName = 'YourCertificateName';


CREATE PROCEDURE GetLatestPriceApprovalRequest
    @requestId NVARCHAR(128),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for decryption
        DECLARE @sql NVARCHAR(MAX);
        SET @sql = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';
        EXEC sp_executesql @sql;

        -- Select and decrypt data
        SELECT
            CAST(REPLACE(DecryptByKey(req_id), CHAR(0), '') AS NVARCHAR(128)) AS req_id,
            CAST(REPLACE(DecryptByKey(grade), CHAR(0), '') AS NVARCHAR(50)) AS grade,
            CAST(REPLACE(DecryptByKey(fsc), CHAR(0), '') AS NVARCHAR(50)) AS fsc,
            CAST(REPLACE(DecryptByKey(grade_type), CHAR(0), '') AS NVARCHAR(50)) AS grade_type,
            CAST(REPLACE(DecryptByKey(gsm_range_from), CHAR(0), '') AS NVARCHAR(MAX)) AS gsm_range_from,
            CAST(REPLACE(DecryptByKey(gsm_range_to), CHAR(0), '') AS NVARCHAR(MAX)) AS gsm_range_to,
            CAST(REPLACE(DecryptByKey(agreed_price), CHAR(0), '') AS NVARCHAR(MAX)) AS agreed_price,
            CAST(REPLACE(DecryptByKey(special_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS special_discount,
            CAST(REPLACE(DecryptByKey(reel_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS reel_discount,
            CAST(REPLACE(DecryptByKey(pack_upcharge), CHAR(0), '') AS NVARCHAR(MAX)) AS pack_upcharge,
            CAST(REPLACE(DecryptByKey(tpc), CHAR(0), '') AS NVARCHAR(MAX)) AS tpc,
            CAST(REPLACE(DecryptByKey(offline_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS offline_discount,
            CAST(REPLACE(DecryptByKey(net_nsr), CHAR(0), '') AS NVARCHAR(MAX)) AS net_nsr,
            CAST(REPLACE(DecryptByKey(old_net_nsr), CHAR(0), '') AS NVARCHAR(MAX)) AS old_net_nsr,
            id
        FROM price_approval_requests_price_table
        WHERE CAST(REPLACE(DecryptByKey(req_id), CHAR(0), '') AS NVARCHAR(128)) = @requestId
          AND id = (SELECT MAX(id) 
                    FROM price_approval_requests_price_table 
                    WHERE CAST(REPLACE(DecryptByKey(req_id), CHAR(0), '') AS NVARCHAR(128)) = @requestId);

        -- Close the symmetric key
        SET @sql = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';
        EXEC sp_executesql @sql;
    END TRY
    BEGIN CATCH
        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        RETURN;
    END CATCH
END;


-- EXEC GetPriceApprovalRequestDetails 
--     @RequestID = 'NR202408050001',
--     @Role = 'RM',
--     @SymmetricKeyName = 'YourSymmetricKeyName',
--     @CertificateName = 'YourCertificateName';


CREATE PROCEDURE GetPriceApprovalRequestDetails
    @RequestID NVARCHAR(50),
    @Role NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for decryption
        DECLARE @sql NVARCHAR(MAX);
        SET @sql = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';
        EXEC sp_executesql @sql;

        -- Select and decrypt data
        SELECT 
            CAST(REPLACE(DecryptByKey(PAQ.req_id), CHAR(0), '') AS NVARCHAR(128)) AS req_id,
            CAST(REPLACE(DecryptByKey(PAQ.grade), CHAR(0), '') AS NVARCHAR(50)) AS grade,
            CAST(REPLACE(DecryptByKey(PAQ.fsc), CHAR(0), '') AS NVARCHAR(50)) AS fsc,
            CAST(REPLACE(DecryptByKey(PAQ.grade_type), CHAR(0), '') AS NVARCHAR(50)) AS grade_type,
            CAST(REPLACE(DecryptByKey(PAQ.gsm_range_from), CHAR(0), '') AS NVARCHAR(MAX)) AS gsm_range_from,
            CAST(REPLACE(DecryptByKey(PAQ.gsm_range_to), CHAR(0), '') AS NVARCHAR(MAX)) AS gsm_range_to,
            CAST(REPLACE(DecryptByKey(PAQ.agreed_price), CHAR(0), '') AS NVARCHAR(MAX)) AS agreed_price,
            CAST(REPLACE(DecryptByKey(PAQ.special_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS special_discount,
            CAST(REPLACE(DecryptByKey(PAQ.reel_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS reel_discount,
            CAST(REPLACE(DecryptByKey(PAQ.pack_upcharge), CHAR(0), '') AS NVARCHAR(MAX)) AS pack_upcharge,
            CAST(REPLACE(DecryptByKey(PAQ.tpc), CHAR(0), '') AS NVARCHAR(MAX)) AS tpc,
            CAST(REPLACE(DecryptByKey(PAQ.offline_discount), CHAR(0), '') AS NVARCHAR(MAX)) AS offline_discount,
            CAST(REPLACE(DecryptByKey(PAQ.net_nsr), CHAR(0), '') AS NVARCHAR(MAX)) AS net_nsr,
            CAST(REPLACE(DecryptByKey(PAQ.old_net_nsr), CHAR(0), '') AS NVARCHAR(MAX)) AS old_net_nsr,
            PC.Grade,
            BAV.[key],
            BAV.status 
        FROM 
            price_approval_requests_price_table PAQ
        INNER JOIN 
            profit_center PC ON CAST(REPLACE(DecryptByKey(PAQ.grade), CHAR(0), '') AS NVARCHAR(50)) = PC.Grade
        INNER JOIN 
            business_admin_variables BAV ON BAV.value = LEFT(CAST(ABS(PC.Profit_Centre) AS VARCHAR(10)), 1)
        WHERE 
            CAST(REPLACE(DecryptByKey(PAQ.req_id), CHAR(0), '') AS NVARCHAR(128)) = @RequestID 
            AND BAV.[key] = @Role;

        -- Close the symmetric key
        SET @sql = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';
        EXEC sp_executesql @sql;

    END TRY
    BEGIN CATCH
        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        RETURN;
    END CATCH
END;



-- DECLARE @request_name NVARCHAR(50) = 'NR202408010001';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetPriceApprovalRequestByRequestName @request_name, @SymmetricKeyName, @CertificateName;



CREATE PROCEDURE GetPriceApprovalRequestByRequestName
    @request_name NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for decryption
        DECLARE @sql NVARCHAR(MAX);
        SET @sql = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';
        EXEC sp_executesql @sql;

        -- Select and decrypt data
   SELECT
                req_id,
                CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(customer_id)) AS customer_id,
                CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(consignee_id)) AS consignee_id,
                end_use_id,
                plant,
                end_use_segment_id,
                valid_from,
                valid_to,
                payment_terms_id,
                request_name,
                mappint_type,
                am_id
            FROM price_approval_requests
            WHERE request_name = @request_name;


        -- Close the symmetric key
        SET @sql = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';
        EXEC sp_executesql @sql;

    END TRY
    BEGIN CATCH
        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        RETURN;
    END CATCH
END;



-- DECLARE @request_name NVARCHAR(50) = 'NR202408010001';
-- DECLARE @SymmetricKeyName NVARCHAR(128) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(128) = 'YourCertificateName';

-- EXEC GetPriceApprovalRequestByRequestName @request_name, @SymmetricKeyName, @CertificateName;



CREATE PROCEDURE GetPriceApprovalRequestByRequestName
    @request_name NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Open the symmetric key for decryption
        DECLARE @sql NVARCHAR(MAX);
        SET @sql = 'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';
        EXEC sp_executesql @sql;

        -- Select and decrypt data
   SELECT
                req_id,
                CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(customer_id)) AS customer_id,
                CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(consignee_id)) AS consignee_id,
                end_use_id,
                plant,
                end_use_segment_id,
                valid_from,
                valid_to,
                payment_terms_id,
                request_name,
                mappint_type,
                am_id
            FROM price_approval_requests
            WHERE request_name = @request_name;


        -- Close the symmetric key
        SET @sql = 'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';
        EXEC sp_executesql @sql;

    END TRY
    BEGIN CATCH
        -- Error handling
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        RETURN;
    END CATCH
END;



-- EXEC InsertPriceApprovalReq 
--     @customer_id, @consignee_id, @end_use_id, @plant, 
--     @end_use_segment_id, @valid_from, @valid_to, 
--     @payment_terms_id, @request_name, @mappint_type, @am_id
--     @SymmetricKeyName,@CertificateName

CREATE PROCEDURE [dbo].[InsertPriceApprovalReq]
     @customer_id NVARCHAR(MAX),
    @consignee_id NVARCHAR(MAX),
    @end_use_id NVARCHAR(MAX),
    @plant NVARCHAR(MAX),
    @end_use_segment_id NVARCHAR(MAX),
    @valid_from DATETIME2(7),
    @valid_to DATETIME2(7),
    @payment_terms_id NVARCHAR(MAX),
    @request_name NVARCHAR(50),
    @mappint_type TINYINT,
    @am_id NVARCHAR(50),
    @SymmetricKeyName NVARCHAR(128),
    @CertificateName NVARCHAR(128)
AS
BEGIN
    BEGIN TRY
        -- Construct the dynamic SQL statements for opening and closing the symmetric key
        DECLARE @OpenSymmetricKeySQL NVARCHAR(MAX);
        DECLARE @CloseSymmetricKeySQL NVARCHAR(MAX);

        SET @OpenSymmetricKeySQL = N'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + N';';
        SET @CloseSymmetricKeySQL = N'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + N';';

        -- Open the symmetric key for encryption
        EXEC sp_executesql @OpenSymmetricKeySQL;

        -- Insert the encrypted values into the table
      INSERT INTO price_approval_requests (
        customer_id, consignee_id, end_use_id, plant, end_use_segment_id, 
        valid_from, valid_to, payment_terms_id, request_name, mappint_type, am_id
    )
    OUTPUT
        INSERTED.req_id,
        CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(INSERTED.customer_id)) AS customer_id,
        CONVERT(NVARCHAR(MAX), DECRYPTBYKEY(INSERTED.consignee_id)) AS consignee_id,
        INSERTED.end_use_id,
        INSERTED.plant,
        INSERTED.end_use_segment_id,
        INSERTED.valid_from,
        INSERTED.valid_to,
        INSERTED.payment_terms_id,
        INSERTED.request_name,
        INSERTED.mappint_type,
        INSERTED.am_id
    VALUES (
        ENCRYPTBYKEY(KEY_GUID(@SymmetricKeyName), @customer_id),
        ENCRYPTBYKEY(KEY_GUID(@SymmetricKeyName), @consignee_id),
        @end_use_id, @plant, @end_use_segment_id,
        @valid_from, @valid_to,
        @payment_terms_id, @request_name,
        @mappint_type, @am_id
    );

        -- Close the symmetric key
        EXEC sp_executesql @CloseSymmetricKeySQL;
    END TRY
    BEGIN CATCH
        -- Handle errors
        IF (SELECT ISNULL(XACT_STATE(), 0)) <> 0
        BEGIN
            ROLLBACK TRANSACTION;
        END

        DECLARE @ErrorMessage NVARCHAR(4000);
        DECLARE @ErrorSeverity INT;
        DECLARE @ErrorState INT;

        SELECT 
            @ErrorMessage = ERROR_MESSAGE(),
            @ErrorSeverity = ERROR_SEVERITY(),
            @ErrorState = ERROR_STATE();

        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);

        -- Close the symmetric key if an error occurs
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = @SymmetricKeyName)
        BEGIN
            EXEC sp_executesql @CloseSymmetricKeySQL;
        END
    END CATCH
END;
GO


-- DECLARE @Ids NVARCHAR(MAX) = '1,2,3,4';
-- DECLARE @SymmetricKeyName NVARCHAR(100) = 'YourSymmetricKeyName';
-- DECLARE @CertificateName NVARCHAR(100) = 'YourCertificateName';

-- EXEC FetchNamesByIds @Ids, @SymmetricKeyName, @CertificateName;

CREATE PROCEDURE FetchNamesByIds
    @Ids NVARCHAR(MAX),          -- Expecting a comma-separated list of IDs
    @SymmetricKeyName NVARCHAR(100), -- Symmetric Key Name as a parameter
    @CertificateName NVARCHAR(100)   -- Certificate Name as a parameter
AS
BEGIN
    -- Build the dynamic SQL to open the symmetric key
    DECLARE @SqlOpenKey NVARCHAR(MAX) = 
    'OPEN SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + 
    ' DECRYPTION BY CERTIFICATE ' + QUOTENAME(@CertificateName) + ';';

    -- Execute the dynamic SQL to open the symmetric key
    EXEC sp_executesql @SqlOpenKey;

    -- Build the dynamic SQL for the SELECT query
    DECLARE @Sql NVARCHAR(MAX) =
    'SELECT [id], 
           CONVERT(VARCHAR(100), DECRYPTBYKEY([Name])) AS [DecryptedName]
    FROM [PriceApprovalSystem].[dbo].[customer]
    WHERE [id] IN (' + @Ids + ');';

    -- Execute the dynamic SQL for the SELECT query
    EXEC sp_executesql @Sql;

    -- Close the symmetric key
    DECLARE @SqlCloseKey NVARCHAR(MAX) = 
    'CLOSE SYMMETRIC KEY ' + QUOTENAME(@SymmetricKeyName) + ';';

    EXEC sp_executesql @SqlCloseKey;
END;



  -- Open the symmetric key for decryption
    OPEN SYMMETRIC KEY YourSymmetricKeyName
        DECRYPTION BY CERTIFICATE YourCertificateName;

-- Insert encrypted data into the table
INSERT INTO customer (Code, Category, A_C_group, Sales_office, Name, City, Search_term, Status, TPC_code) VALUES
(1, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'), ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'), ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'), ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aaditya'), ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'), ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aaditya-Delhi'), 2, NULL),
(2, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
 ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
 ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aarya'),
 ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
 ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aarya-Hyderābād'), 1, NULL),
(3, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhay'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhay-Kolkāta'), 1, NULL),
(4, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhijeet'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhijeet-Mumbai'), 2, NULL),
(5, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhinandan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhinandan-Chennai'), 1, NULL),
(6, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhinay'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhinay-Hyderābād'), 2, NULL),
(7, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhishek'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abhishek-Pune'), 2, NULL),
(8, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abimanyu'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Abimanyu-Ahmedabad'), 2, NULL),
(9, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aditya'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Aditya-Sūrat'), 1, NULL),
(10, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Akhil'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Akhil-Delhi'), 2, NULL),
(11, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office west'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Akshat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Akshat-Hyderābād'), 1, NULL),
(12, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Anil'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Anil-Kolkāta'), 1, NULL),
(13, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Avi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Avi-Mumbai'), 2, NULL),
(14, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Balaraam'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Balaraam-Mumbai'), 1, NULL),
(15, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bharat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bharat-Kolkāta'), 1, NULL),
(16, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bhaskar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bhaskar-Bangalore'), 2, NULL),
(17, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bhaumik'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bhaumik-Chennai'), 1, NULL),
(18, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bijay'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bijay-Hyderābād'), 1, NULL),
(19, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Brijesh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Brijesh-Delhi'), 1, NULL),
(20, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chandan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chandan-Hyderābād'), 2, NULL),
(21, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chetan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chetan-Kolkāta'), 1, NULL),
(22, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office west'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chirag'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chirag-Mumbai'), 1, NULL),
(23, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chiranjeeve'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lucknow'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chiranjeeve-Lucknow'), 2, NULL),
(24, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office west'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Daksh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Daksh-Jaipur'), 2, NULL),
(25, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Daman'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Daman-Delhi'), 1, NULL),
(26, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Depen'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Depen-Mumbai'), 1, NULL),
(27, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Dev'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Dev-Kolkāta'), 2, NULL),
(28, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Dhruv'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Dhruv-Delhi'), 1, NULL),
(29, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Divyanshu'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Divyanshu-Hyderābād'), 2, NULL),
(30, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekambar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekambar-Kolkāta'), 1, NULL),
(31, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekansh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekansh-Mumbai'), 2, NULL),
(32, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekaraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ekaraj-Ahmedabad'), 2, NULL),
(33, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Eklavya'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Eklavya-Sūrat'), 2, NULL),
(34, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Elilarasan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prayagraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Elilarasan-Prayagraj'), 2, NULL),
(35, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Falak'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lucknow'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Falak-Lucknow'), 2, NULL),
(36, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gagan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gagan-Jaipur'), 2, NULL),
(37, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gajendra'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gajendra-Delhi'), 1, NULL),
(38, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'EXP-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Garv'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Garv-Hyderābād'), 2, NULL),
(39, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gaurav'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gaurav-Kolkāta'), 1, NULL),
(40, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gautam'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Gautam-Mumbai'), 2, NULL),
(41,ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hardik'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hardik-Bangalore'), 1, NULL),
(42, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Harsh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Harsh-Chennai'), 2, NULL),
(43, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Saeles office AP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hemant'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hemant-Hyderābād'), 1, NULL),
(44, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hridaya'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hridaya-Pune'), 1, NULL),
(45, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Indivar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Indivar-Ahmedabad'), 1, NULL),
(46, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jagat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jagat-Hyderābād'), 2, NULL),
(47, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jai-Delhi'), 1, NULL),
(48, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'END-USE'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jashith'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jashith-Hyderābād'), 1, NULL),
(49, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayant'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayant-Kolkāta'), 1, NULL),
(50, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayesh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayesh-Mumbai'), 2, NULL),
(51, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayin'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jayin-Mumbai'), 1, NULL),
(52, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jitendra'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jitendra-Kolkāta'), 1, NULL),
(53, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'INTERDIV_CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kalap'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kalap-Bangalore'), 1, NULL),
(54, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kalapi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kalapi-Chennai'), 1, NULL),
(55, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kartik'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kartik-Hyderābād'), 2, NULL),
(56, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kashyap'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kashyap-Pune'), 1, NULL),
(57, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kavin'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kavin-Ahmedabad'), 2, NULL),
(58, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Keshav'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Keshav-Sūrat'), 1, NULL),
(59, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Keval'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prayagraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Keval-Prayagraj'), 1, NULL),
(60, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kishore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kishore-Jaipur'), 2, NULL),
(61, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Krishna'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lucknow'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Krishna-Lucknow'), 1, NULL),
(62, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Krishnamurari'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Krishnamurari-Delhi'), 1, NULL),
(63, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lalit'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lalit-Hyderābād'), 2, NULL),
(64, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lokesh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lokesh-Kolkāta'), 2, NULL),
(65, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Madhav'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Madhav-Mumbai'), 1, NULL),
(66, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'), 
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Madhukar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Madhukar-Bangalore'), 2, NULL),
(67, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manan-Chennai'), 2, NULL),
(68, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office corporate'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manav'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manav-Pune'), 1, NULL),
(69, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manik'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Manik-Ahmedabad'), 1, NULL),
(70, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mann'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mann-Sūrat'), 1, NULL),
(71, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mayank'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prayagraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mayank-Prayagraj'), 1, NULL),
(72, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mihir'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mihir-Jaipur'), 1, NULL),
(73, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mohak'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lucknow'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mohak-Lucknow'), 2, NULL),
(74, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mohan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mohan-Delhi'), 1, NULL),
(75, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mukund'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mukund-Hyderābād'), 1, NULL),
(76, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Navnit'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Navnit-Kolkāta'), 2, NULL),
(77, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nishith'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nishith-Mumbai'), 2, NULL),
(78, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEND'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nitesh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nitesh-Bangalore'), 1, NULL),
(79, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nitin'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Nitin-Chennai'), 2, NULL),
(80, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Om'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Om-Hyderābād'), 1, NULL),
(81, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Omkar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Omkar-Pune'), 1, NULL),
(82, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Paarth'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Paarth-Ahmedabad'), 2, NULL),
(83, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pahal'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pahal-Sūrat'), 2, NULL),
(84, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Palash'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prayagraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Palash-Prayagraj'), 1, NULL),
(85, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Param'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Param-Jaipur'), 2, NULL),
(86, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Paran'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Paran-Delhi'), 2, NULL),
(87, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Parth'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Parth-Hyderābād'), 2, NULL),
(88, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pawan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Kolkāta'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pawan-Kolkāta'), 1, NULL),
(89, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pinak'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Mumbai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pinak-Mumbai'), 2, NULL),
(90, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pritam'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Bangalore'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pritam-Bangalore'), 1, NULL),
(91, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prithvi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Chennai'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prithvi-Chennai'), 2, NULL),
(92, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Punit'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Punit-Hyderābād'), 1, NULL),
(93, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pushkar'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pune'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Pushkar-Pune'), 2, NULL),
(94, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office South'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rahul'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ahmedabad'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rahul-Ahmedabad'), 2, NULL),
(95, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office NAC'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rajendra'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sūrat'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rajendra-Sūrat'), 2, NULL),
(96, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Raman'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Prayagraj'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Raman-Prayagraj'), 1, NULL),
(97, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office DHQ'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ranjan'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Jaipur'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ranjan-Jaipur'), 1, NULL),
(98, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office East'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rathin'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Lucknow'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Rathin-Lucknow'), 2, NULL),
(99, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CUST'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZEXP'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office export'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ravi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Delhi'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Ravi-Delhi'), 1, NULL),
(100, ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'DOM-CONS'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'ZDOM'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Sales office North'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Reyansh'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Hyderābād'),
ENCRYPTBYKEY(KEY_GUID('YourSymmetricKeyName'), N'Reyansh-Hyderābād'), 1, NULL);

    -- Close the symmetric key after the operation
    CLOSE SYMMETRIC KEY YourSymmetricKeyName;