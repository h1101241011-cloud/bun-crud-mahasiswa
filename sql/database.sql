-- Buat database kampus
CREATE DATABASE IF NOT EXISTS kampus;
USE kampus;

-- Tabel mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100),
  jurusan VARCHAR(100),
  angkatan INT
);

-- Data awal
INSERT INTO mahasiswa (nama, jurusan, angkatan)
VALUES
  ('Andi', 'Sistem Informasi', 2022),
  ('Siti', 'Informatika', 2023),
  ('Budi', 'Teknik Komputer', 2021);