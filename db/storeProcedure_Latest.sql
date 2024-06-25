CREATE PROCEDURE FetchUserByEmployeeId
    @employee_id VARCHAR(255) 
AS
BEGIN
    SELECT *
    FROM define_roles
    WHERE employee_id = @employee_id;
END;

CREATE PROCEDURE FetchRoleByRoleID
    @role VARCHAR(255) 
AS
BEGIN
    SELECT *
    FROM role_matrix
    WHERE role = @role;
END;