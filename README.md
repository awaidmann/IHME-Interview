# IHME-Interview
----------
## Nested Density Plot for Global Obesity/Overweight Prevalance Metrics

### Overview

The Nested Density Plot (NDP) UI displays 3 colorcoded data points per x,y coordinate. Each set of 3 datapoints is stacked in descending order, with the largest value being on the bottom. This allows the user to gauge the proportional difference between the points in a straightforward manner. And for specific values, the user can hover over any data point and read the accompanying, colorcoded tooltip. The actual radii of the data points is determined by the percent of the area of the unit circle that that data point represents; if the point is 0.5 then the corresponding circle takes up half of the unit circles area, the point radius is NOT half full radius. 

The x-axis spans the years 1990 to 2103 while the y-axis spans the non-"age standardized" age groupings (i.e. "2 to 4 yrs", "5 to 9 yrs", etc...).

The menu on the left hand side allows the user to narrow down which three (related) data points they would like to compare. The "Comparison Type" dropdown allows the user to compare either gender groupings or measurement groupings. If they choose "Gender" they will be then be able to specify if they want to compare each gender's 'mean', 'lower', or 'upper' bound measurements to the other genders. Conversely if the user choose "Measurement Bounds" as their comparision type, then they will be able to specify which gender they would like to compare the 'mean', 'lower', and 'upper' bounds for.

Additional options allow the user to change the location/region and metric type (obesity/overweight) which are being visualized.

### Build
`npm run build`

Runs both the app build and data preprocessing tasks. I have included my bundled app and preprocessed data files in this repository. See below for details.

#### App
`npm run build:app`

Because I wanted to leverage the power of React, the app must first be built into a loadable bundle. The build system is a combination of Gulp, Babel, and Rollup which allows me to use ES6 JavaScript while also greatly reducing build sizes, especially for large dependencies like D3. The bundled app can be found under `./build/app.js` and `./build/app.js.map`. Currently, `app.js` is being loaded directly by the `index.html` file.

#### Data
`npm run build:data`

Due to the data file's large size and redunancy, I choose to preprocess the CSV file into a number of much smaller and easier to use JSON files. They can be found in the `./dist/` directory. Currently, they are split by country/region abbreviation, but could be divided by any field in the original CSV files.

###### Settings/Config

All data preprocessing configuration can be found in the `data.config.js` file, options are as follows:

```javascript
module.exports = {
  legend: './path/to/_codebook.CSV',
  data: './path/to/data.CSV',
  sort_order: ['csv_col_to_divide_into_json_files', 'inner_file_col', 'inner_file_col_2', ['value_1', 'value_2', 'value_3']]
}
```

The first value in the `sort_order` array is the header that is used to group the remaining data into a single JSON file. The last value in the array is an array of data points to be taken from each line in the csv file. It is assumed that these column headers are the actual values/data points in each line and not categorical group columns.
