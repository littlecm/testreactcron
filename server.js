const express = require('express');
const axios = require('axios');
const csv = require('csv-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 'your_db_port',
});

app.post('/update-inventory-feed', async (req, res) => {
  try {
    const response = await axios.get('https://your-url.com/inventory-feed.csv', {
      responseType: 'stream',
    });

    const results = [];
    response.data.pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        await updateDatabase(results);
        res.status(200).send('Inventory feed updated successfully.');
      });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating inventory feed.');
  }
});

const updateDatabase = async (data) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const vehicle of data) {
      // Add your logic here to update the database
      // You may need to check if the vehicle exists, update it if it does, or insert it if it doesn't
      const {
        id, cab, vin, fuel, make, msrp, type, year, doors, model, engine, images, mileage, options,
        city_mpg, comments, lot_date, bodystyle, certified, dealer_id, modelcode, saleprice, trimlevel,
        wheelbase, dealership, drivetrain, enginesize, askingprice, details_url, highway_mpg, retailvalue,
        stocknumber, invoiceprice, transmission, exteriorcolor, interiorcolor, internetprice, dealership_url,
        wholesaleprice, dealership_city, dealership_phone, dealership_state, exteriorcolorcode, interiorcolorcode,
        dealership_country, dealership_address1, dealership_address2, dealership_postalcode
      } = vehicle;

      await client.query(`
        INSERT INTO public.dealerdotcom (
          id, cab, vin, fuel, make, msrp, type, year, doors, model, engine, images, mileage, options,
          city_mpg, comments, lot_date, bodystyle, certified, dealer_id, modelcode, saleprice, trimlevel,
          wheelbase, dealership, drivetrain, enginesize, askingprice, details_url, highway_mpg, retailvalue,
          stocknumber, invoiceprice, transmission, exteriorcolor, interiorcolor, internetprice, dealership_url,
          wholesaleprice, dealership_city, dealership_phone, dealership_state, exteriorcolorcode, interiorcolorcode,
          dealership_country, dealership_address1, dealership_address2, dealership_postalcode
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
          $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
          $45, $46, $47, $48, $49, $50, $51
        ) ON CONFLICT (vin) DO UPDATE SET
          cab = EXCLUDED.cab,
          fuel = EXCLUDED.fuel,
          make = EXCLUDED.make,
          msrp = EXCLUDED.msrp,
          type = EXCLUDED.type,
          year = EXCLUDED.year,
          doors = EXCLUDED.doors,
          model = EXCLUDED.model,
          engine = EXCLUDED.engine,
          images = EXCLUDED.images,
          mileage = EXCLUDED.mileage,
          options = EXCLUDED.options,
          city_mpg = EXCLUDED.city_mpg,
          comments = EXCLUDED.comments,
          lot_date = EXCLUDED.lot_date,
          bodystyle = EXCLUDED.bodystyle,
          certified = EXCLUDED.certified,
          dealer_id = EXCLUDED.dealer_id,
          modelcode = EXCLUDED.modelcode,
          saleprice = EXCLUDED.saleprice,
          trimlevel = EXCLUDED.trimlevel,
          wheelbase = EXCLUDED.wheelbase,
          dealership = EXCLUDED.dealership,
          drivetrain = EXCLUDED.drivetrain,
          enginesize = EXCLUDED.enginesize,
          askingprice = EXCLUDED.askingprice,
          details_url = EXCLUDED.details_url,
          highway_mpg = EXCLUDED.highway_mpg,
          retailvalue = EXCLUDED.retailvalue,
          stocknumber = EXCLUDED.stocknumber,
          invoiceprice = EXCLUDED.invoiceprice,
          transmission = EXCLUDED.transmission,
          exteriorcolor = EXCLUDED.exteriorcolor,
          interiorcolor = EXCLUDED.interiorcolor,
          internetprice = EXCLUDED.internetprice,
          dealership_url = EXCLUDED.dealership_url,
          wholesaleprice = EXCLUDED.wholesaleprice,
          dealership_city = EXCLUDED.dealership_city,
          dealership_phone = EXCLUDED.dealership_phone,
          dealership_state = EXCLUDED.dealership_state,
          exteriorcolorcode = EXCLUDED.exteriorcolorcode,
          interiorcolorcode = EXCLUDED.interiorcolorcode,
          dealership_country = EXCLUDED.dealership_country,
          dealership_address1 = EXCLUDED.dealership_address1,
          dealership_address2 = EXCLUDED.dealership_address2,
          dealership_postalcode = EXCLUDED.dealership_postalcode
      `, [
        id, cab, vin, fuel, make, msrp, type, year, doors, model, engine, images, mileage, options,
        city_mpg, comments, lot_date, bodystyle, certified, dealer_id, modelcode, saleprice, trimlevel,
        wheelbase, dealership, drivetrain, enginesize, askingprice, details_url, highway_mpg, retailvalue,
        stocknumber, invoiceprice, transmission, exteriorcolor, interiorcolor, internetprice, dealership_url,
        wholesaleprice, dealership_city, dealership_phone, dealership_state, exteriorcolorcode, interiorcolorcode,
        dealership_country, dealership_address1, dealership_address2, dealership_postalcode
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
