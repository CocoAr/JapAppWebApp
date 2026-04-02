-- Remap legacy topic category_id values to the new taxonomy (single-topic model).
-- word_progress is untouched — progress is keyed by word_id only.

UPDATE category_progress SET category_id = 'personas' WHERE mode = 'topic' AND category_id = 'people_relationships';
UPDATE category_progress SET category_id = 'cuerpo' WHERE mode = 'topic' AND category_id = 'body';
UPDATE category_progress SET category_id = 'animales' WHERE mode = 'topic' AND category_id = 'animals';
UPDATE category_progress SET category_id = 'naturaleza_y_clima' WHERE mode = 'topic' AND category_id = 'nature_weather_landscape';
UPDATE category_progress SET category_id = 'comida_y_bebida' WHERE mode = 'topic' AND category_id = 'food_drink';
UPDATE category_progress SET category_id = 'objetos_cotidianos' WHERE mode = 'topic' AND category_id = 'everyday_objects';
UPDATE category_progress SET category_id = 'lugares_e_instituciones' WHERE mode = 'topic' AND category_id = 'home_places_buildings';
UPDATE category_progress SET category_id = 'transporte' WHERE mode = 'topic' AND category_id = 'transport';
UPDATE category_progress SET category_id = 'estudio_e_idioma' WHERE mode = 'topic' AND category_id = 'study_language_communication';
UPDATE category_progress SET category_id = 'tiempo_y_calendario' WHERE mode = 'topic' AND category_id = 'time_calendar';
UPDATE category_progress SET category_id = 'numeros' WHERE mode = 'topic' AND category_id = 'numbers';
UPDATE category_progress SET category_id = 'expresiones_y_posiciones' WHERE mode = 'topic' AND category_id = 'basic_expressions_directions';
UPDATE category_progress SET category_id = 'pasatiempos_y_ocio' WHERE mode = 'topic' AND category_id = 'hobbies_leisure';
UPDATE category_progress SET category_id = 'colores' WHERE mode = 'topic' AND category_id = 'colors';

-- Old "work_daily_life" mixed several new categories; drop aggregate rows rather than mis-map.
DELETE FROM category_progress WHERE mode = 'topic' AND category_id = 'work_daily_life';
