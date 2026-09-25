-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: bitacora_cultural
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `bitacora_cultural`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `bitacora_cultural` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `bitacora_cultural`;

--
-- Table structure for table `libros`
--

DROP TABLE IF EXISTS `libros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `libros` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `estado` enum('En progreso','Terminado','Abandonado') NOT NULL DEFAULT 'En progreso',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `opinion` text DEFAULT NULL,
  `frase_favorita` text DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_libros_usuario` (`usuario_id`),
  CONSTRAINT `fk_libros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_libros_calificacion` CHECK (`calificacion` is null or `calificacion` between 1 and 5),
  CONSTRAINT `chk_libros_fechas` CHECK (`fecha_inicio` is null or `fecha_finalizacion` is null or `fecha_finalizacion` >= `fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `peliculas`
--

DROP TABLE IF EXISTS `peliculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `peliculas` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `director` varchar(255) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `estado` enum('En progreso','Terminado','Abandonado') NOT NULL DEFAULT 'En progreso',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `opinion` text DEFAULT NULL,
  `frase_favorita` text DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_peliculas_usuario` (`usuario_id`),
  CONSTRAINT `fk_peliculas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_peliculas_calificacion` CHECK (`calificacion` is null or `calificacion` between 1 and 5),
  CONSTRAINT `chk_peliculas_fechas` CHECK (`fecha_inicio` is null or `fecha_finalizacion` is null or `fecha_finalizacion` >= `fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `series` (
  `id` char(36) NOT NULL,
  `usuario_id` char(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `creador` varchar(255) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `calificacion` tinyint(3) unsigned DEFAULT NULL,
  `estado` enum('En progreso','Terminado','Abandonado') NOT NULL DEFAULT 'En progreso',
  `total_temporadas` smallint(5) unsigned DEFAULT NULL,
  `temporada_actual` smallint(5) unsigned DEFAULT NULL,
  `ultimo_episodio` smallint(5) unsigned DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_finalizacion` date DEFAULT NULL,
  `opinion` text DEFAULT NULL,
  `frase_favorita` text DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_series_usuario` (`usuario_id`),
  CONSTRAINT `fk_series_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_series_calificacion` CHECK (`calificacion` is null or `calificacion` between 1 and 5),
  CONSTRAINT `chk_series_temporadas` CHECK (`total_temporadas` is null or `total_temporadas` > 0),
  CONSTRAINT `chk_series_temporada_actual` CHECK (`temporada_actual` is null or `temporada_actual` > 0 and (`total_temporadas` is null or `temporada_actual` <= `total_temporadas`)),
  CONSTRAINT `chk_series_ultimo_episodio` CHECK (`ultimo_episodio` is null or `ultimo_episodio` > 0 and `temporada_actual` is not null),
  CONSTRAINT `chk_series_fechas` CHECK (`fecha_inicio` is null or `fecha_finalizacion` is null or `fecha_finalizacion` >= `fecha_inicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` char(36) NOT NULL,
  `email` varchar(254) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-25  7:27:16
