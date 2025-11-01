// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Identeefi {
    address public owner; 

    struct Product {
        string name;
        string serialNumber;
        string description;
        string brand;
        string image;
        string manufacturer;
        string createdAt;
        string expiryDate;
        mapping(uint => ProductHistory) history;
        uint historySize;
        bool exists;
    }

    mapping(string => Product) products;
    mapping(uint => ProductHistory) history;    

    struct ProductHistory {
        uint id;
        string actor;
        string location;
        string timestamp;
        bool isSold;
        string note;
    }

    event ProductRegistered(
        string indexed serialNumber,
        string name,
        string manufacturer,
        string createdAt,
        string expiryDate
    );

    event ProductUpdated(
        string indexed serialNumber,
        string actor,
        string timestamp,
        bool isSold,
        string expiryDate,
        string note
    );

    function registerProduct(
        string memory _name,
        string memory _brand,
        string memory _serialNumber,
        string memory _description,
        string memory _image,
        string memory _manufacturer,
        string memory _location,
        string memory _timestamp,
        string memory _expiryDate
    ) public {
        Product storage p = products[_serialNumber];
        require(!p.exists, "Product already registered");

        p.exists = true;
        p.name = _name;
        p.brand = _brand;
        p.serialNumber = _serialNumber;
        p.description = _description;
        p.image = _image;
        p.manufacturer = _manufacturer;
        p.createdAt = _timestamp;
        p.expiryDate = _expiryDate;
        p.historySize = 0;

        _addProductHistory(p, _manufacturer, _location, _timestamp, false, "Registered");

        emit ProductRegistered(_serialNumber, _name, _manufacturer, _timestamp, _expiryDate);
    }

    function addProductHistory(
        string memory _serialNumber,
        string memory _actor,
        string memory _location,
        string memory _timestamp,
        bool _isSold,
        string memory _note,
        string memory _expiryDate
    ) public {
        Product storage p = products[_serialNumber];
        require(p.exists, "Product not found");

        if (bytes(_expiryDate).length != 0) {
            p.expiryDate = _expiryDate;
        }

        _addProductHistory(p, _actor, _location, _timestamp, _isSold, _note);

        emit ProductUpdated(_serialNumber, _actor, _timestamp, _isSold, p.expiryDate, _note);
    }

    function getProduct(string memory _serialNumber)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            ProductHistory[] memory
        )
    {
        Product storage product = products[_serialNumber];
        require(product.exists, "Product not found");

        ProductHistory[] memory pHistory = new ProductHistory[](product.historySize);

        for (uint i = 0; i < product.historySize ; i++) {
            pHistory[i] = product.history[i+1];            

        }

        return (
            product.serialNumber,
            product.name,
            product.brand,
            product.description,
            product.image,
            product.manufacturer,
            product.createdAt,
            product.expiryDate,
            pHistory
        );
    }

    function _addProductHistory(
        Product storage p,
        string memory _actor,
        string memory _location,
        string memory _timestamp,
        bool _isSold,
        string memory _note
    ) private {
        p.historySize++;
        p.history[p.historySize] = ProductHistory(p.historySize, _actor, _location, _timestamp, _isSold, _note);

        console.log("History size: %s", p.historySize);
        console.log("Product History added: %s", p.history[p.historySize].actor);
        console.log("Product : %s", p.name);
        console.log("Note : %s", _note);
    }

}
    