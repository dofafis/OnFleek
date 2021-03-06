-- MySQL Script generated by MySQL Workbench
-- Dom 08 Abr 2018 21:44:41 -04
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema OnFleek
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema OnFleek
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `OnFleek` DEFAULT CHARACTER SET utf8 ;
USE `OnFleek` ;

-- -----------------------------------------------------
-- Table `OnFleek`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OnFleek`.`Usuario` (
  `idUsuario` INT NOT NULL AUTO_INCREMENT,
  `nomeUsuario` VARCHAR(90) NOT NULL,
  `dataNascimentoUsuario` DATE NOT NULL,
  `emailUsuario` VARCHAR(100) NOT NULL,
  `senhaUsuario` VARCHAR(150) NOT NULL,
  `admUsuario` TINYINT(1) NOT NULL,
  PRIMARY KEY (`idUsuario`),
  CONSTRAINT Usuario_unique UNIQUE (emailUsuario))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OnFleek`.`Titulo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OnFleek`.`Titulo` (
  `idTitulo` INT NOT NULL AUTO_INCREMENT,
  `sinopseTitulo` VARCHAR(7000) NOT NULL,
  `diretorTitulo` VARCHAR(200) NOT NULL,
  `anoProducaoTitulo` INT NOT NULL,
  `duracaoMinutosTitulo` INT NOT NULL,
  `classificacaoTitulo` VARCHAR(150) NOT NULL,
  `paisOrigemTitulo` VARCHAR(100) NOT NULL,
  `generoTitulo` VARCHAR(100) NOT NULL,
  `tipoTitulo` VARCHAR(30) NOT NULL,
  `estreiaMundialTitulo` DATE NOT NULL,
  `estreiaBrasilTitulo` DATE,
  PRIMARY KEY (`idTitulo`),
  CONSTRAINT Titulo_unique UNIQUE (estreiaMundialTitulo,diretorTitulo,generoTitulo,tipoTitulo))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `OnFleek`.`Usuario_Comenta_Titulo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OnFleek`.`Usuario_Comenta_Titulo` (
  `idComentario` INT NOT NULL AUTO_INCREMENT,
  `Usuario_idUsuario` INT NOT NULL,
  `Titulo_idTitulo` INT NOT NULL,
  `descricaoComentario` VARCHAR(500) NULL,
  PRIMARY KEY (`idComentario`),
  CONSTRAINT `fk_Usuario_has_Titulo_Usuario`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_has_Titulo_Titulo1`
    FOREIGN KEY (`Titulo_idTitulo`)
    REFERENCES `OnFleek`.`Titulo` (`idTitulo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `OnFleek`.`Usuario_Conversa_Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OnFleek`.`Usuario_Conversa_Usuario` (
  `idMensagem` INT NOT NULL AUTO_INCREMENT,
  `Usuario_idUsuario1` INT NOT NULL,
  `Usuario_idUsuario2` INT NOT NULL,
  `mensagem` VARCHAR(5000) NULL,
  PRIMARY KEY (`idMensagem`),
  CONSTRAINT `fk_Usuario_has_Usuario_Usuario200`
    FOREIGN KEY (`Usuario_idUsuario1`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_has_Usuario_Usuario100`
    FOREIGN KEY (`Usuario_idUsuario2`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `OnFleek`.`Usuario_Lista_Titulo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `OnFleek`.`Usuario_Lista_Titulo` (
  `Usuario_idUsuario` INT NOT NULL,
  `Titulo_idTitulo` INT NOT NULL,
  `nomeLista` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`Usuario_idUsuario`,`Titulo_idTitulo`,`nomeLista`),
  CONSTRAINT `fk_Usuario_has_Titulo_Usuario1`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_has_Titulo_Titulo2`
    FOREIGN KEY (`Titulo_idTitulo`)
    REFERENCES `OnFleek`.`Titulo` (`idTitulo`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Usuario_has_Titulo_Lista3`
    FOREIGN KEY (`nomeLista`)
    REFERENCES `OnFleek`.`Lista` (`nomeLista`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`Usuario_Avalia_Titulo` (
  `Usuario_idUsuario` INT NOT NULL,
  `Titulo_idTitulo` INT NOT NULL,
  `estrelas` INT NOT NULL,
  PRIMARY KEY (`Usuario_idUsuario`,`Titulo_idTitulo`),
  CONSTRAINT `fk_Usuario_has_Titulo_Usuario10`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_Usuario_has_Titulo_Titulo20`
    FOREIGN KEY (`Titulo_idTitulo`)
    REFERENCES `OnFleek`.`Titulo` (`idTitulo`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`generosTitulo` (
	`idGenero` INT NOT NULL AUTO_INCREMENT,
	`genero` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idGenero`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`tiposTitulo` (
        `idTipo` INT NOT NULL AUTO_INCREMENT,
        `tipo` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idTipo`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`paisesTitulo` (
        `idPais` INT NOT NULL AUTO_INCREMENT,
        `pais` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idPais`))
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`foto_Usuario` (
  `Usuario_idUsuario` INT NOT NULL,
  `caminhoFoto` VARCHAR(700) NOT NULL,
  PRIMARY KEY (`Usuario_idUsuario`,`caminhoFoto`),
  CONSTRAINT `fk_Usuario_caminho_Foto`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`foto_Titulo` (
  `Titulo_idTitulo` INT NOT NULL,
  `caminhoFoto` VARCHAR(700) NOT NULL,
  PRIMARY KEY (`Titulo_idTitulo`),
  CONSTRAINT `fk_Titulo_caminho_Foto`
    FOREIGN KEY (`Titulo_idTitulo`)
    REFERENCES `OnFleek`.`Titulo` (`idTitulo`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`foto_Genero` (
  `Genero_idGenero` INT NOT NULL,
  `caminhoFoto` VARCHAR(700) NOT NULL,
  PRIMARY KEY (`Genero_idGenero`,`caminhoFoto`),
  CONSTRAINT `fk_Genero_caminho_Foto`
    FOREIGN KEY (`Genero_idGenero`)
    REFERENCES `OnFleek`.`generosTitulo` (`idGenero`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `OnFleek`.`Lista` (
  `nomeLista` VARCHAR(45) NOT NULL,
  `Usuario_idUsuario` INT NOT NULL,
  PRIMARY KEY (`nomeLista`,`Usuario_idUsuario`),
  CONSTRAINT `fk_Usuario_idUsuario`
    FOREIGN KEY (`Usuario_idUsuario`)
    REFERENCES `OnFleek`.`Usuario` (`idUsuario`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
