2.4. Configuración de los planes
Se va a tener una configuración de los planes que debe funcionar de la siguiente manera:

Al momento de crear un nuevo artículo se debe traer la información de los planes que se encuentran creados en configuración: planes base. Estos planes se deben visualizar de manera de tabla en donde se especifique:

Precio del artículo en el plan base: costo x marcación del plan

Marcación del plan base: coeficiente por el cual se va a multiplicar el precio del artículo para el plan

Si es precio al 100% o si es un plan de descuento al 50%. Esto va a afectar posteriormente la comisión. 

Ya que el artículo tiene por defecto la información de los planes base, se puede modificar la marcación por cada plan. No se va a poder modificar información como: los días financiados, el precio del artículo en el plan (este es calculado). Lo único que se puede llegar a modificar es el coeficiente de la marcación del plan en el artículo. 

Para ayudar al usuario, se debe visualizar la información del precio y marcación del plan base comparado con el precio y marcación del plan del artículo.

Un plan base (siempre van a ser todos los mismos para todos los artículos) puede activarse/desactivarse el plan en el artículo. Esto no va a modificar los planes base, solo modifica si se activa/desactiva el plan en el artículo a crear. 

El plan de financiación a 1 día es lo mismo que decir la venta de contado, este plan no se puede inactivar en un artículo ya que es el referente a la venta de contado. El artículo puede no tener ningún plan de financiación (a más de 1 cuota) activo, esto significa que sólo se va a poder vender por venta de contado.  

Entonces funcionaría de la siguiente manera: se crea un artículo nuevo, a este artículo se le asocia la información de los planes base, por cada plan se puede modificar la marcación o inactivar el plan para el artículo, más no se puede modificar ninguna información neta del plan. 

1.11. Planes Modelo
Son los planes modelo bajo los cuales se realiza la creación y la comparación de los planes de los artículos. Los planes modelo son los que van a regir los días de los planes y la marcación base del plan. 

Atributos

Descripción

ID

ID

Días

Nombre

Marcación base

 

Tipo

Selección única: Sin descuento (100%) o Con descuento (50%)

Ejemplo

ID

Días Planes

Tipo

Marcación

ID

Días Planes

Tipo

Marcación

1

30

Sin descuento (100%)

1.8

2

30

Con descuento (50%)

1.4

3

90

Sin descuento (100%)

2.1

4

120

Sin descuento (100%)

2.2

