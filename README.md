# Ecommerce Rest Api with Database Schema

Steps :- 
1 - clone
2 - npm i 
3 - create .env with :-

JWT_SECRET="your_jwt_secret_key"
DATABASE_URL="postgres://postgres:123456@localhost:5432/ecom_db"
PORT=5321

4 - npm start


Api Flow :- 

1)  auth    ->   Signup
                 Login
                 Logout
2)  product ->   Get All Products List
3)  cart    ->   Add to cart - again adding same product will increase the quantity in Cart table
            ->   Checkout - address, phone number, method of payment -> checking out will add cart items to Order table
4)  order   ->   Place order - will remove items from cart and add to order_items table, and will also update the stock
            ->   Get Order - will fetch last order of the signed in user.
            ->   Get All Orders - will fetch all orders of user.
    
-------------------------------------------------------------------------------------------------------------------------------------------------------------------
Task-2 Queries :- 

1)Find the second highest order value from an "Orders" table

SELECT MAX(total_amount) AS second_highest_order_value 
FROM orders
WHERE total_amount < (SELECT MAX(total_amount) FROM orders);
-------------------------------------------------------------------------------------------------------

2)Monthly Orders analysis for the year 2023

SELECT
    TO_CHAR(order_date, 'Month') AS month_name,
    EXTRACT(MONTH FROM order_date) AS month,
    COUNT(*) AS total_orders,
    COALESCE(SUM(total_amount), 0) AS total_revenue
FROM orders
WHERE EXTRACT(YEAR FROM order_date) = 2023
GROUP BY month_name, month
ORDER BY month;

-------------------------------------------------------------------------------------------------------

3)Find User wise ordering summary - No. of products, total orders with total value.

SELECT
    users.id AS user_id,
    users.username,
    COUNT(DISTINCT orders.id) AS total_orders,
    COALESCE(SUM(order_items.quantity), 0) AS total_products_ordered,
    COALESCE(SUM(orders.total_amount), 0) AS total_order_value
FROM users
LEFT JOIN orders ON users.id = orders.user_id
LEFT JOIN order_items ON orders.id = order_items.order_id
GROUP BY users.id, users.username;

-------------------------------------------------------------------------------------------------------

4)Find the products which are sold less than 3 times or not sold yet in the last quarter of 2023

SELECT
    products.id AS product_id,
    products.name,
    COALESCE(SUM(order_items.quantity), 0) AS total_quantity_sold
FROM products
LEFT JOIN order_items ON products.id = order_items.product_id
LEFT JOIN orders ON order_items.order_id = orders.id AND orders.order_date >= '2023-08-01' AND orders.order_date <= '2023-12-31'
GROUP BY products.id
HAVING COALESCE(SUM(order_items.quantity), 0) < 3;
