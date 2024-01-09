<?php
require_once('vendor/autoload.php'); // Include Stripe PHP library

\Stripe\Stripe::setApiKey('pk_test_51OWlyoHkveMnlLCoaQdBpI5tNfyOq2ZXKQCXTNUpqTpw5KsAuDVIMCRg2YbVEOAXxHubQKDaAlZn0qv8VlSGrSKh00zUjvhVgj'); // Set your secret key

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
