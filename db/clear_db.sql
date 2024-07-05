/*
To dump database use this.
*/

TRUNCATE TABLE [define_roles];
TRUNCATE TABLE [defined_rules];
TRUNCATE TABLE [price_approval_requests];
TRUNCATE TABLE [price_approval_requests_price_table];
TRUNCATE TABLE [transaction];
TRUNCATE TABLE [request_status]; 
TRUNCATE TABLE [files];  
TRUNCATE TABLE [remarks]; 

MVC
TRUNCATE TABLE [rule_mvc];
    TRUNCATE TABLE [requests_mvc]
    TRUNCATE TABLE [price_approval_requests];
    TRUNCATE TABLE [price_approval_requests_price_table];
    TRUNCATE TABLE [transaction_mvc];
    TRUNCATE TABLE [request_status]; 
    TRUNCATE TABLE [files];     
    TRUNCATE TABLE [remarks];
    TRUNCATE TABLE [pre_approved_request_status_mvc]
    TRUNCATE TABLE [request_mapper]
    TRUNCATE TABLE [audit_log]

CREATE TABLE requests_mvc (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    req_id NVARCHAR(255),
    status INT,
    pending TINYINT
);

CREATE TABLE pre_approved_request_status_mvc (
    id INT PRIMARY KEY IDENTITY,
    request_name NVARCHAR(MAX),
    aret_request_name NVARCHAR(MAX)
);


/*
Redundat tables
category
customer
material
profit_center
region
rules
*/


/*

To add a BAM.

*/
INSERT INTO [dbo].[define_roles]
           ([employee_name]
           ,[employee_id]
           ,[role]
           ,[region]
           ,[created_by]
           ,[created_date]
           ,[active])
     VALUES
           ('Admin'
           ,'e1'
           ,'BAM'
           ,''
           ,''
           ,''
           ,1)
GO
