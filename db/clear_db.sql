/*
To dump database use this.
*/

TRUNCATE TABLE [define_roles];
TRUNCATE TABLE [defined_rules];
TRUNCATE TABLE [price_approval_requests];
TRUNCATE TABLE [price_approval_requests_price_table];
TRUNCATE TABLE [transaction];
TRUNCATE TABLE [request_status];

/*
Redundat tables
category
customer
material
profit_center
region
rules
*/

UPDATE  [transaction]
SET rm = '1'
WHERE id = 12;