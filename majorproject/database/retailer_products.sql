-- Create table to track products scanned by retailers
CREATE TABLE IF NOT EXISTS public.retailer_product (
    id SERIAL PRIMARY KEY,
    retailer_username VARCHAR(50) NOT NULL,
    serial_number VARCHAR(50) NOT NULL,
    scanned_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (retailer_username) REFERENCES profile(username),
    FOREIGN KEY (serial_number) REFERENCES product(serialNumber),
    UNIQUE(retailer_username, serial_number)
);

CREATE INDEX idx_retailer_product_username ON public.retailer_product(retailer_username);
CREATE INDEX idx_retailer_product_serial ON public.retailer_product(serial_number);

