# Plan de Desarrollo: Módulo de Ventas

Este documento describe el plan de desarrollo para implementar el módulo de ventas.

## Paso 1: Estructura de Datos

1.  **Crear la entidad `Waiter`**: Para manejar a los "coimanes" (camareros), crearemos una nueva entidad `waiter.entity.ts`. Esta entidad tendrá su propio ID, nombre, documento.
    *   `id`: (PK)
    *   `name`: string
    *   `document`: number

2.  **Modificar la entidad `Sale`**: La entidad `sale.entity.ts` será actualizada para reflejar una venta por mesa.
    *   `id`: (PK)
    *   `tableNumber`: number
    *   `waiterId`: (FK to `Waiter` entity)
    *   `totalAmount`: number
    *   `createdAt`: Date

3.  **Crear la entidad `SaleItem`**: Crearemos `sale-item.entity.ts` para registrar cada bebida en una venta.
    *   `id`: (PK)
    *   `saleId`: (FK to `Sale` entity)
    *   `beverageId`: (FK to `Beverage` entity)
    *   `quantity`: number
    *   `price`: number (at the time of sale)

4.  **Actualizar DTOs**: Se actualizarán los DTOs (`create-sale.dto.ts`) para que coincidan con la nueva estructura de datos.

## Paso 2: Lógica de Negocio (Servicios)

1.  **Crear `waiter.service.ts` y `waiter.controller.ts`**: Se implementará un servicio y un controlador para gestionar los camareros (crear, obtener, etc.).

2.  **Actualizar `sales.service.ts`**:
    *   Se creará un método `createSale` que:
        *   Reciba el `waiterId`, `tableNumber` y una lista de `items` (bebidas y cantidades).
        *   Calcule el `totalAmount` de la venta sumando el precio de cada `SaleItem`.
        *   Guarde la nueva `Sale` en la base de datos.
        *   Guarde cada `SaleItem` asociado a la venta.

## Paso 3: API (Controlador)

1.  **Actualizar `sales.controller.ts`**:
    *   Se creará un endpoint `POST /sales` que utilice el `sales.service` para registrar una nueva venta.
    *   El endpoint recibirá los datos del `create-sale.dto.ts`.

## Paso 4: Módulos

1.  **Crear `waiter.module.ts`**: Se creará un módulo para la gestión de camareros.
2.  **Actualizar `sales.module.ts`**: Se importarán las dependencias necesarias (como `WaiterModule` y los nuevos providers).
3.  **Actualizar `app.module.ts`**: Se importará el nuevo `WaiterModule`.
