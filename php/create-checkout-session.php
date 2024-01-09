<?php
require_once('vendor/autoload.php'); // Include Stripe PHP library

\Stripe\Stripe::setApiKey('sk_test_51OWlyoHkveMnlLCoJO75gBd8zv5erxijENxRHxpX1LlRf3pvDR0ayPoLUULppoLQcq2O3uTlw1Nb9A9KClMJST1O00rtFXbOPf'); // Set your secret key

header('Content-Type: application/json');

try {
  // Create a new Checkout Session
  $session = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [
      [
        'price_data' => [
          'currency' => 'usd',
          'product_data' => [
            'name' => 'Your Product',
          ],
          'unit_amount' => 499, // Amount in cents
        ],
        'quantity' => 1,
      ],
    ],
    'mode' => 'payment',
    'success_url' => 'http://localhost/football/landing/landing.html#registration-popup?success=yes',
    'cancel_url' => 'http://localhost/football/landing/landing.html#registration-popup?success=no',
  ]);

  echo json_encode(['id' => $session->id]);
} catch (Exception $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
?>
