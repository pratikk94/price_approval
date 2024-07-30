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
    @RuleId NVARCHAR(128),
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
            SET @StatusSTR = 'AND CONVERT(VARCHAR(128), DecryptByKey(currently_pending_with)) = @Role';
            SET @StatusIM = 'status = 0';
        END
        ELSE IF @Status = 3 AND @Role = 'RM'
        BEGIN
            SET @StatusSTR = 'AND CONVERT(VARCHAR(128), DecryptByKey(currently_pending_with)) = @Role';
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
            SELECT MAX(id) AS maxId, CONVERT(VARCHAR(128), DecryptByKey(request_id)) AS request_id
            FROM transaction_mvc
            WHERE CONVERT(VARCHAR(128), DecryptByKey(request_id)) IN (SELECT req_id FROM FilteredRequests)
            GROUP BY CONVERT(VARCHAR(128), DecryptByKey(request_id))
        ),
        MaxDetails AS (
            SELECT m.maxId, m.request_id, CONVERT(VARCHAR(128), DecryptByKey(t.current_status)) AS current_status
            FROM transaction_mvc t
            INNER JOIN MaxIds m ON t.id = m.maxId
        ),
        RelatedTransactions AS (
            SELECT 
                t.id,
                t.rule_id,
                CONVERT(VARCHAR(128), DecryptByKey(t.currently_pending_with)) AS currently_pending_with,
                CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_role)) AS last_updated_by_role,
                CONVERT(VARCHAR(128), DecryptByKey(t.last_updated_by_id)) AS last_updated_by_id,
                CONVERT(VARCHAR(128), DecryptByKey(t.current_status)) AS current_status,
                CONVERT(VARCHAR(128), DecryptByKey(t.request_id)) AS request_id,
                t.created_at
            FROM transaction_mvc t
            INNER JOIN MaxDetails m ON CONVERT(VARCHAR(128), DecryptByKey(t.request_id)) = m.request_id AND CONVERT(VARCHAR(128), DecryptByKey(t.current_status)) = m.current_status
        )
        SELECT *
        FROM RelatedTransactions
        WHERE EXISTS (
            SELECT 1
            FROM transaction_mvc
            WHERE CONVERT(VARCHAR(128), DecryptByKey(request_id)) = RelatedTransactions.request_id
            AND CONVERT(VARCHAR(128), DecryptByKey(current_status)) = RelatedTransactions.current_status
            AND id != RelatedTransactions.id
        ) ' + @StatusSTR + '
        UNION
        SELECT 
            t.id,
            t.rule_id,
            CAST(REPLACE(DecryptByKey(t.currently_pending_with), CHAR(0), '''') AS VARCHAR(128)) AS currently_pending_with,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_role), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_role,
            CAST(REPLACE(DecryptByKey(t.last_updated_by_id), CHAR(0), '''') AS VARCHAR(128)) AS last_updated_by_id,
            CAST(REPLACE(DecryptByKey(t.current_status), CHAR(0), '''') AS VARCHAR(128)) AS current_status,
            CAST(REPLACE(DecryptByKey(t.request_id), CHAR(0), '''') AS VARCHAR(128)) AS request_id,
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
