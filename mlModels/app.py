import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from flask import Flask, request, jsonify

app = Flask(__name__)

# Baca dataset dari file CSV
data = pd.read_excel('E:/Capstone/NutriSeeNew/foodd (1).xlsx')  

import re

def extract_ingredients(text):
    ingredients = []
    for item in text:
        ingredient_list = re.findall(r'[\w\s]+(?=,|$)', item)
        ingredients.extend(ingredient_list)
    return ingredients

ingredients = extract_ingredients(data['Bahan'])
ingredients_string = ', '.join(ingredients)

print(ingredients_string)

import json

def extract_ingredients(row):
    try:
        bahan = json.loads(row)
        return [item['Bahan'] for item in bahan]
    except:
        return []

data['Extracted Ingredients'] = data['Bahan'].apply(extract_ingredients)

print(data['Extracted Ingredients'])

data['Extracted Ingredients'] = data['Extracted Ingredients'].apply(lambda x: [ingredient.replace('-', '') for ingredient in x])

# Mengubah daftar "Extracted Ingredients" menjadi string
data['Ingredients String'] = data['Extracted Ingredients'].apply(lambda x: ', '.join(x))

from sklearn.preprocessing import MultiLabelBinarizer
# Menggunakan MultiLabelBinarizer untuk encoding variabel "Ingredients String"
mlb = MultiLabelBinarizer()
bahan_encoded = mlb.fit_transform(data['Ingredients String'])

# Menggunakan OneHotEncoder untuk encoding variabel "Bahan"
bahan = data['Bahan'].values.reshape(-1, 1)  # Reshape to (n_samples, 1)
encoder = OneHotEncoder(sparse=False)
bahan_encoded = encoder.fit_transform(bahan)

# Mengisi nilai yang hilang dengan 0
data.fillna(0, inplace=True)

# Membaca atribut gizi sebagai fitur
features = data[['Kalori', 'Protein', 'Karbo', 'Lemak', 'Serat']].values

# Normalisasi fitur
features_norm = (features - features.mean(axis=0)) / features.std(axis=0)

# Membaca atribut rekomendasi sebagai target
target = data['Makanan'].astype('category').cat.codes

# Menggabungkan -0--- dan variabel "Bahan" yang telah di-encode
features_encoded = np.concatenate((features_norm, bahan_encoded), axis=1)

from keras.models import load_model
model = load_model('my_model.h5')

def get_top_5_recommendations(nutrition_data, allergies=[]):
    # Normalisasi data gizi pengguna
    nutrition_data_norm = (nutrition_data - features.mean(axis=0)) / features.std(axis=0)

    # Memprediksi probabilitas kelas makanan
    predictions = model.predict(np.array([nutrition_data_norm]))

    # Mendapatkan indeks 5 kelas dengan probabilitas tertinggi
    top_5_indices = np.argsort(predictions[0])[::-1][:5]

    # Mendapatkan nama-nama makanan yang direkomendasikan
    recommended_foods = data.loc[data['Makanan'].astype('category').cat.codes.isin(top_5_indices), 'Makanan'].values

    # Pengecualian jika memiliki alergi terhadap bahan tertentu
    recommended_foods = [food for food in recommended_foods if all(allergy not in food for allergy in allergies)]

    return recommended_foods[:5]

def calculate_bmr(weight, height, age, gender):
    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    return bmr

@app.route('/recommend', methods=['GET'])
def recommend_food():
    weight = request.json['weight']
    height = request.json['height']
    age = request.json['age']
    gender = request.json['gender']
    allergies = request.json['allergies']

    bmr = calculate_bmr(weight, height, age, gender)
    nutrition_data = [bmr]

    recommended_foods = get_top_5_recommendations(nutrition_data, allergies)

    response = {
        'recommended_foods': recommended_foods
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run()



