$(function(){

  // Variables to hold cart total, items, and a timer interval
  let cartTotal = 0;
  let cartItems = [];
  let timerInterval;

  // Renders the store inventory to the page
  const render = function (items) {

    // Hide any modals and empty the inventory area
    $('.modal').modal('hide');
    $('#sale-items').empty();

    // Loop through the items and append them to the #sale-items table
    items.forEach(function(item){
      $('#sale-items').append(buildItemRow(item));
    });
  }

  // Gets the products list from our API
  const getItems = function () {

    // Clear any intervals
    clearInterval(timerInterval);

    // GET request to retrieve products, then run render function
    $.get('/api/products').then(render);
  }

  // Returns a <tr> element with the item information
  const buildItemRow =  function (item) {

    // Create new <tr> element
    const tr = $('<tr>');

    // Create a new number input with minimum of 0 and the same id as the item
    const input = $('<input>').attr({
      type: 'number',
      min: 0,
      id: item.id
    });

    // Create a button to add the item to the cart
    const button = $('<button>')
      .addClass('btn btn-warning add-to-cart')
      .text('Add to Cart')
      .attr('data-id', item.id);

    // Append <td> elements for the qty input, name, stock, price, and button
    tr.append(
      $('<td>').append(input),
      $('<td>').text(item.product_name),
      $('<td>').text(item.stock_quantity),
      $('<td>').text(`$${item.price}`),
      $('<td>').append(button)
    );

    // Return the <tr> element
    return tr;
  }

  // Adds a new row to the shopping cart
  const addCartRow = function (qty, item) {

    // Calculate the total for that line item
    const itemTotal = item.price * qty;

    // Add the item total to the cart total
    cartTotal += itemTotal;

    // Reduce the item stock quantity by the requested quantity
    item.stock_quantity -= qty;

    // Push the item into our cart array
    cartItems.push(item);

    // Create a new <tr> element
    const tr = $('<tr>').addClass(`cart-${item.id}`);

    // Appends the qty, name, price, and total to the tr element
    tr.append(
      $('<td>').text(qty),
      $('<td>').text(item.product_name),
      $('<td>').text(`$${item.price}`),
      $('<td>').text(`$${itemTotal.toFixed(2)}`)
    );

    // Append the <tr> to the cart table, and update the cart total
    $('#cart-items').append(tr);
    $('.cart-total').text(`$${cartTotal.toFixed(2)}`);
  }

  // Displays an alert message to the user
  const message = function (type, text) {
    $('#messages')
      .addClass(`alert alert-${type}`)
      .text(text);

    // Clear the message after 3 seconds
    timerInterval = setTimeout(clearMessages, 3000)
  }

  // Clears any messages
  const clearMessages = function() {
    $('#messages').empty().removeClass();
  }

  // Adds item to cart
  const addItemToCart = function () {

    // Clear messages
    clearMessages();
    const id = $(this).attr('data-id');

    // Get the product data then run updateCart function
    $.get(`/api/products/${id}`).then(updateCart);
  }

  // Checks if quantity is valid and adds the item to the cart if so
  const updateCart = function (data) {
    const numRequested = $(`#${data.id}`).val();

    // Check if the quantiy requested is greated the quantity available 
    if ( numRequested > data.stock_quantity ) {

      // If it is, alert the user that their quantity is invalid
      message('danger', `We're sorry. We only have ${data.stock_quantity} in stock`);
    } else {

      // Otherwise, add the row to the cart and alert the user of its success
      addCartRow(numRequested, data);
      message('success', 'Item(s) successfully added to cart!');
      $(`#${data.id}`).val('');
    }
  }

  // Performs the checkout actions
  const checkout = function () {

    // Update the quantity of each item using a PUT request
    cartItems.forEach(function(item) {
      $.ajax({
        method: 'PUT',
        url: `/api/products/${item.id}`,
        data: item
      });
    });

    // Reset our cart variables and empty the cart on the DOM
    cartItems = [];
    cartTotal = 0;
    $('#cart-items').empty();

    // After 5 seconds, get all items from the database
    timerInterval = setTimeout(getItems, 5000);
  }

  // Trigger the initial retrieval of prodcut inventory
  getItems();

  //=========================
  // EVENT LISTENERS
  //=========================
  
  $('#sale-items').on('click', '.add-to-cart', addItemToCart);
  $('#checkout').on('click', checkout);
  $('#close').on('click', getItems);

});