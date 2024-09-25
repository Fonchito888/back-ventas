--- Tabla USUARIO

-- Inserción en la tabla USUARIO
INSERT INTO USUARIO (USU_NOMBRE, USU_APELLIDO, USU_DIRECCION, USU_TELEFONO, 
USU_IDENTIFICACION, USU_USUARIO, USU_PASSWORD) 
VALUES ('Victor', 'Perez', '123 Admin St', '1234567890', '123456', 'admin', 'admin');

-- Ver los datos asociados al usuario junto con el rol
SELECT *
FROM USUARIO
JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
JOIN ROLES ON USR_ROL_ID = ROL_ID
WHERE USU_ID = 1;

-- Ver los usuarios con rol de cliente
SELECT *
FROM USUARIO
JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
JOIN ROLES ON USR_ROL_ID = ROL_ID
WHERE ROL_NOMBRE = 'cliente';

-- Ver el rol con el que se va a loguear
SELECT * 
FROM USUARIO 
JOIN ROLESUSUARIO ON USU_ID = USR_USU_ID
JOIN ROLES ON USR_ROL_ID = ROL_ID 
WHERE USU_USUARIO = 'admin' AND USU_PASSWORD = '*Prueba1' AND ROL_NOMBRE = 'cliente';

---

--- Tabla ROLES

-- Inserción en la tabla ROLES
INSERT INTO ROLES (ROL_NOMBRE) VALUES ('administrador');
INSERT INTO ROLES (ROL_NOMBRE) VALUES ('cliente');

---

--- Tabla ROLESUSUARIO

-- Inserción de asignación del rol
INSERT INTO ROLESUSUARIO (USR_USU_ID, USR_ROL_ID) VALUES (1, 2);

---

--- Tabla PRODUCTOS

-- Eliminar con rango
DELETE FROM PRODUCTOS 
WHERE PRO_ID BETWEEN 2 AND 30;

---

--- Tabla VENTACONTADO

-- Inserción de ventacontado
INSERT INTO VENTACONTADO (VNT_NUMCARTA, VNT_FECHA, VNT_CLI_ID, VNT_PRO_ID, VNT_USU_ID) 
VALUES (1, '2002-01-01', 11, 32, 3);

-- Ver los datos del pro, del cli y el admin asociados a ventacontado
SELECT 
	VNT_ID,
	VNT_NUMCARTA,
	VNT_FECHA,
    VNT_CLI_ID,
    USU_CLI.USU_NOMBRE,
    USU_CLI.USU_APELLIDO,
    USU_CLI.USU_IDENTIFICACION,
    USU_CLI.USU_TELEFONO,
	PRO_ID,
    PRO_NOMBREPRODUCTO,
	PRO_ESTADO,
	PRO_PRECIOVENTA,
	PRO_GANANCIA,
    VNT_USU_ID,
    USU_ADM.USU_NOMBRE, 
    USU_ADM.USU_APELLIDO
FROM 
    PRODUCTOS
JOIN 
    VENTACONTADO ON PRO_ID = VNT_PRO_ID
JOIN 
    USUARIO AS USU_CLI ON VNT_CLI_ID = USU_CLI.USU_ID
JOIN 
    USUARIO AS USU_ADM ON VNT_USU_ID = USU_ADM.USU_ID
WHERE 
    VNT_USU_ID = 3;
