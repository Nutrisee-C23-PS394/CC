const tfnode = require('@tensorflow/tfjs-node');
const db = require('../config/database');

const fetchFoodDatabase = async () => {
  try {
    const rows = await db.query('SELECT Kalori, Protein, Karbo, Lemak, Serat FROM food');
    // console.log(rows[1]);
    const data = rows.map((row) => [row.Kalori, row.Protein, row.Karbo, row.Lemak, row.Serat]);
    // console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching food nutrition from the database:', error);
  }
};

function calculateMean(data) {
  const rowCount = data.length;
  const columnCount = data[0].length;
  const mean = [];

  for (let col = 0; col < columnCount; col++) {
    let sum = 0;

    for (let row = 0; row < rowCount; row++) {
      sum += data[row][col];
    }

    const columnMean = sum / rowCount;
    mean.push(columnMean);
  }

  return mean;
}

function calculateStandardDeviation(data) {
  const rowCount = data.length;
  const columnCount = data[0].length;
  const mean = calculateMean(data);
  const standardDeviation = [];

  for (let col = 0; col < columnCount; col++) {
    let sumOfSquares = 0;

    for (let row = 0; row < rowCount; row++) {
      const deviation = data[row][col] - mean[col];
      sumOfSquares += deviation * deviation;
    }

    const columnStdDev = Math.sqrt(sumOfSquares / rowCount);
    standardDeviation.push(columnStdDev);
  }

  return standardDeviation;
}

const calculateBMR = (weight, height, age, gender) => {
  const result =
    gender.toLowerCase() === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return result;
};

// function getTopKIndices(array, k) {
//   // Create an array of indices [0, 1, 2, ..., array.length - 1]
//   const indices = Array.from(array.keys());
//   // return Array.from(array.keys());

//   // Sort the indices based on the values in the array
//   indices.sort((a, b) => array[b] - array[a]);

//   // Return the top k indices
//   return indices.slice(0, k);
// }

function argsortReverse(predictions) {
  // Create an array of indices
  const indices = Array.from(predictions[0].keys());
  // const indices = Array.from(predictions.keys());
  // console.log(indices);

  // Sort the indices based on the corresponding values in predictions[0]
  indices.sort((a, b) => predictions[0][b] - predictions[0][a]);
  console.log('hasil sorting', indices);

  return indices;
}

const foodPredictRecomendation = async (nutritionUserData) => {
  try {
    const data = await fetchFoodDatabase();
    const mean = calculateMean(data);
    const std = calculateStandardDeviation(data);
    // const handler = await tfnode.io.fileSystem('model.json');
    const model = await tfnode.loadLayersModel('file://model.json');

    const nutritionUserDataNorm = nutritionUserData.map((row, i) => (row - mean[i]) / std[i]);
    // console.log(nutritionUserDataNorm);
    console.log('normalisasi nutrisi user data', [nutritionUserDataNorm]);
    // const inputTensor = tfnode.tensor2d([nutritionUserDataNorm], [1, nutritionUserDataNorm.length]);

    const predictions = model.predict(tfnode.tensor([nutritionUserDataNorm]));
    const predictionsArray = await predictions.array();
    // const predictionsValue = predictions.arraySync()[0];
    argsortReverse(predictionsArray);
    // console.log(predictionsArray);

    // const recommendationIndices = getTopKIndices(predictionsArray[0], 5);
    // const recommendations = recommendationIndices.map(index => data[index]);
  } catch (error) {
    console.log(error);
  }
};

const weight = 80;
const height = 180;
const age = 21;
const gender = 'male';
const bmr = calculateBMR(weight, height, age, gender);
const nutrition_data = [bmr, bmr, bmr, bmr, bmr];

console.log('bmr user data', bmr)
foodPredictRecomendation(nutrition_data);
module.exports = { foodPredictRecomendation };
