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
