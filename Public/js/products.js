var productListUl = document.getElementById("ul_pr");
var productListItems = document.querySelectorAll("li");

function addProduct(id) {
  var newProductListItem = document.createElement("li");
  var newProductListItemText = document.createTextNode(id);
  newProductListItem.appendChild(newProductListItemText);
  productListUl.appendChild(newProductListItem);
  productListUl.appendChild(document.createElement("br"));
}

window.emptyList = function () {
  var productListUl = document.querySelector("#ul_pr");
  var productListLength = productListUl.children.length;

  for (var i = 0; i < productListLength; i++) {
    productListUl.removeChild(productListUl.children[0]);
  }
};
