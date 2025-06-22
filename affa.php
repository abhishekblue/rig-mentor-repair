<?php
// Place this code in your theme's functions.php or a custom plugin file.

function register_repair_request_api_endpoint() {
    register_rest_route( 'repair-requests/v1', '/submit', array(
        'methods' => 'POST', // Only allow POST requests for submission
        'callback' => 'handle_repair_request_submission', // Function to handle the request
        'permission_callback' => 'check_repair_request_permission', // Function to check user permissions
        'args' => array(
            'product_type' => array(
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description' => 'Type of product being repaired.',
            ),
            'product_model' => array(
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description' => 'Model of the product.',
            ),
            'serial_number' => array(
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description' => 'Serial number of the product.',
            ),
            'issue_description' => array(
                'required' => true,
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'description' => 'Detailed description of the issue.',
            ),
            'pickup_date' => array(
                'required' => true,
                'type'     => 'string', // Assuming date string
                'sanitize_callback' => 'sanitize_text_field',
                'description' => 'Requested pickup date.',
            ),
            'user_id' => array(
                'type'     => 'integer',
                'sanitize_callback' => 'absint',
                'description' => 'ID of the logged-in user.',
                'default' => 0,
            ),
            'user_email' => array(
                'type'     => 'string',
                'sanitize_callback' => 'sanitize_email',
                'description' => 'Email of the logged-in user.',
                'default' => '',
            ),
            'uploaded_file_url' => array( // If you send this as a URL
                'type' => 'string',
                'sanitize_callback' => 'esc_url_raw',
                'default' => null,
                'description' => 'URL of any uploaded file.'
            ),
            'status' => array(
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default' => 'repair-booked',
                'description' => 'Status of the repair request.'
            )
        ),
    ) );
}
add_action( 'rest_api_init', 'register_repair_request_api_endpoint' );

/**
 * Checks if a user has permission to submit a repair request.
 * Requires nonce verification for all authenticated users.
 *
 * @param WP_REST_Request $request Full data about the request.
 * @return WP_Error|boolean
 */
function check_repair_request_permission( WP_REST_Request $request ) {
    // If you always require login, uncomment the next line
    if ( ! is_user_logged_in() ) {
        return new WP_Error( 'rest_not_logged_in', __( 'You are not currently logged in.', 'your-text-domain' ), array( 'status' => 401 ) );
    }

    // Always require a valid nonce for authenticated requests.
    // This is vital for security when accepting POST data from the frontend.
    if ( ! wp_verify_nonce( $request->get_header( 'X-WP-Nonce' ), 'wp_rest' ) ) {
        return new WP_Error( 'rest_forbidden', __( 'Invalid nonce.', 'your-text-domain' ), array( 'status' => 403 ) );
    }

    return true; // If nonce is valid, allow access
}

/**
 * Handles the actual repair request submission.
 *
 * @param WP_REST_Request $request Full data about the request.
 * @return WP_REST_Response
 */
function handle_repair_request_submission( WP_REST_Request $request ) {
    $params = $request->get_json_params(); // Get JSON data sent from React

    // Access the data sent from your React form like this:
    $product_type = $params['product_type'];
    $product_model = $params['product_model'];
    $serial_number = $params['serial_number'];
    $issue_description = $params['issue_description'];
    $pickup_date = $params['pickup_date'];
    $user_id = $params['user_id'];
    $user_email = $params['user_email'];
    $uploaded_file_url = $params['uploaded_file_url'];
    $status = $params['status'];

    // --- IMPORTANT: This is where you SAVE the data to your database ---
    // Example (You will replace this with your actual save logic):
    // For now, we'll just return the received data.
    // A common approach is to save this as a custom post type (e.g., 'repair_request').
    // Or save to a custom database table.

    // Simulate saving the data
    $saved_data_id = rand(1000, 9999); // Placeholder for actual ID from DB insert

    // If saving fails:
    // return new WP_REST_Response( array( 'message' => 'Failed to save repair request.' ), 500 );

    // If saving succeeds:
    return new WP_REST_Response( array(
        'message' => 'Repair request submitted successfully!',
        'received_data' => $params, // For debugging: shows what was received
        'repair_id' => $saved_data_id // ID of the newly created entry
    ), 200 );
}