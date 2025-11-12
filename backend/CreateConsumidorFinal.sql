-- Script para crear el cliente Consumidor Final
-- Ejecutar este script si no existe el cliente con ID 1

-- Verificar si ya existe el cliente
IF NOT EXISTS (SELECT 1 FROM Clientes WHERE Id = 1)
BEGIN
    -- Insertar el cliente Consumidor Final
    INSERT INTO Clientes (Nombre, Direccion, Telefono, Correo, FechaCreacion, FechaModificacion)
    VALUES ('Consumidor Final', 'Ciudad', 'N/A', 'consumidor@final.com', GETUTCDATE(), GETUTCDATE());
    
    PRINT 'Cliente "Consumidor Final" creado exitosamente con ID 1.';
END
ELSE
BEGIN
    PRINT 'El cliente "Consumidor Final" ya existe.';
END

-- Verificar el resultado
SELECT * FROM Clientes WHERE Id = 1;