-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 34.93.174.118
-- Generation Time: Jan 06, 2022 at 12:32 AM
-- Server version: 5.7.36-0ubuntu0.18.04.1
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `givees_stage`
--
CREATE DATABASE IF NOT EXISTS `givees_stage` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `givees_stage`;

-- --------------------------------------------------------

--
-- Table structure for table `abouts`
--

CREATE TABLE `abouts` (
  `id` int(11) NOT NULL,
  `about` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `actionradius`
--

CREATE TABLE `actionradius` (
  `id` int(11) NOT NULL,
  `miles` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `addtocarts`
--

CREATE TABLE `addtocarts` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `campaingId` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT '1',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `appbanners`
--

CREATE TABLE `appbanners` (
  `id` int(11) NOT NULL,
  `campaingId` int(11) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `bannerType` int(11) DEFAULT NULL,
  `percentage` varchar(255) DEFAULT NULL,
  `imageId` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `appbannertypes`
--

CREATE TABLE `appbannertypes` (
  `id` int(11) NOT NULL,
  `bannerType` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `appbannertypes`
--

INSERT INTO `appbannertypes` (`id`, `bannerType`, `createdAt`, `updatedAt`) VALUES
(1, 'NotClickable', '2022-01-05 13:21:21', '2022-01-05 13:21:21'),
(2, 'ClickableByUrl', '2022-01-05 13:21:23', '2022-01-05 13:21:23'),
(3, 'ClickableByCampaign', '2022-01-05 13:21:24', '2022-01-05 13:21:24');

-- --------------------------------------------------------

--
-- Table structure for table `appliedPromocodes`
--

CREATE TABLE `appliedPromocodes` (
  `id` int(11) NOT NULL,
  `promocodeId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `BlockUsers`
--

CREATE TABLE `BlockUsers` (
  `id` int(11) NOT NULL,
  `blockerId` int(11) DEFAULT NULL,
  `blockedId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `campaignDetails`
--

CREATE TABLE `campaignDetails` (
  `id` int(11) NOT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `campaignCode` varchar(255) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `productQty` int(11) DEFAULT NULL,
  `avaliablityStock` int(11) DEFAULT NULL,
  `lat` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `campaignDetails`
--

INSERT INTO `campaignDetails` (`id`, `campaignId`, `campaignCode`, `productId`, `productName`, `productQty`, `avaliablityStock`, `lat`, `lng`, `createdAt`, `updatedAt`) VALUES
(1, 1, '0PWRR8WPUY', 1, 'new product', 20, 980, '24.873880804406987', '67.05696344375612', '2022-01-05 13:44:17', '2022-01-05 13:49:25');

-- --------------------------------------------------------

--
-- Table structure for table `campaignLikes`
--

CREATE TABLE `campaignLikes` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `likeType` varchar(255) DEFAULT 'Campaign',
  `likedId` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

CREATE TABLE `campaigns` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `campaignCode` varchar(255) DEFAULT NULL,
  `merchantId` int(11) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `Discount` varchar(255) DEFAULT '0',
  `campaignLongName` varchar(255) DEFAULT NULL,
  `likes` int(11) DEFAULT '0',
  `campaignStartsAt` varchar(255) DEFAULT NULL,
  `campaignExpiresAt` varchar(255) DEFAULT NULL,
  `voucherExpiresAt` varchar(255) DEFAULT NULL,
  `shippingStatus` int(11) DEFAULT NULL,
  `curbSideFlag` tinyint(1) DEFAULT '0',
  `isExpired` tinyint(1) DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '0',
  `counter` varchar(255) DEFAULT NULL,
  `campaingAmount` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `name`, `campaignCode`, `merchantId`, `description`, `Discount`, `campaignLongName`, `likes`, `campaignStartsAt`, `campaignExpiresAt`, `voucherExpiresAt`, `shippingStatus`, `curbSideFlag`, `isExpired`, `isActive`, `counter`, `campaingAmount`, `createdAt`, `updatedAt`) VALUES
(1, 'new campaign', '0PWRR8WPUY', 6, 'new', '0', 'new', 0, '2022-01-05T18:43:52', '2022-01-30T18:43:53', '2022-02-01T18:43:57', 2, 1, 0, 1, '0', '200', '2022-01-05 13:44:17', '2022-01-05 13:45:46');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isDelete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `weight`, `isActive`, `isDelete`, `createdAt`, `updatedAt`) VALUES
(1, 'Organic Category', 'nothing new just old one', 123, 1, 0, '2022-01-05 13:21:57', '2022-01-05 13:21:57'),
(2, 'InOrganic Category', 'nothing new just old one', 123, 1, 0, '2022-01-05 13:21:58', '2022-01-05 13:21:58');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `title` text,
  `desc` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `contactservices`
--

CREATE TABLE `contactservices` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isDelete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `contactUsInfos`
--

CREATE TABLE `contactUsInfos` (
  `id` int(11) NOT NULL,
  `message` text,
  `question` text,
  `service` int(11) DEFAULT NULL,
  `email` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `deliveryOptions`
--

CREATE TABLE `deliveryOptions` (
  `id` int(11) NOT NULL,
  `deliveryName` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `deliveryOptions`
--

INSERT INTO `deliveryOptions` (`id`, `deliveryName`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Local Free Delivery Or Curb Side', 1, '2022-01-05 13:23:58', '2022-01-05 13:21:35'),
(2, 'Pick Up', 1, '2022-01-05 13:23:59', '2022-01-05 13:21:36');

-- --------------------------------------------------------

--
-- Table structure for table `deliveryTypes`
--

CREATE TABLE `deliveryTypes` (
  `id` int(11) NOT NULL,
  `deliveryTypeName` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `deliveryTypes`
--

INSERT INTO `deliveryTypes` (`id`, `deliveryTypeName`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Delivery', 1, '2022-01-05 13:23:56', '2022-01-05 13:21:32'),
(2, 'Curb Delivery', 1, '2022-01-05 13:23:56', '2022-01-05 13:21:33'),
(3, 'Pickup', 1, '2022-01-05 13:23:57', '2022-01-05 13:21:34');

-- --------------------------------------------------------

--
-- Table structure for table `emailverifications`
--

CREATE TABLE `emailverifications` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `isExpired` tinyint(1) DEFAULT '0',
  `tokenCreatedAt` varchar(255) DEFAULT '05/01/2022',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `exceptions`
--

CREATE TABLE `exceptions` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `DeviceType` varchar(255) DEFAULT NULL,
  `errorMessage` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

CREATE TABLE `faqs` (
  `id` int(11) NOT NULL,
  `question` text,
  `answer` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `forgetPasswords`
--

CREATE TABLE `forgetPasswords` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `token` varchar(255) DEFAULT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `isExpired` tinyint(1) DEFAULT '0',
  `tokenCreatedAt` varchar(255) DEFAULT '05/01/2022',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `id` int(11) NOT NULL,
  `senderId` int(11) DEFAULT NULL,
  `receiverId` int(11) DEFAULT NULL,
  `isPending` tinyint(1) DEFAULT '1',
  `isFriend` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`id`, `senderId`, `receiverId`, `isPending`, `isFriend`, `createdAt`, `updatedAt`) VALUES
(3, 3, 4, 0, 1, '2022-01-05 16:49:56', '2022-01-05 16:51:56');

-- --------------------------------------------------------

--
-- Table structure for table `globalCounters`
--

CREATE TABLE `globalCounters` (
  `id` int(11) NOT NULL,
  `counter` int(11) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `howtouses`
--

CREATE TABLE `howtouses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `videoPath` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `imagedata`
--

CREATE TABLE `imagedata` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `imageType` varchar(255) DEFAULT NULL,
  `typeId` int(11) DEFAULT NULL,
  `imageId` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `imagedata`
--

INSERT INTO `imagedata` (`id`, `userId`, `imageType`, `typeId`, `imageId`, `imageUrl`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Product', 1, 'uploads/products/e1f2d2ab15/thumbnail/yaxm6xrezubunegwnwsi', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641390153/uploads/products/e1f2d2ab15/thumbnail/yaxm6xrezubunegwnwsi.png', '2022-01-05 13:42:33', '2022-01-05 13:42:33'),
(2, 1, 'Campaign', 1, 'uploads/campaigns/59d45a1dd1/thumbnail/de2rbpu1zjvx49epe2eq', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641390256/uploads/campaigns/59d45a1dd1/thumbnail/de2rbpu1zjvx49epe2eq.png', '2022-01-05 13:44:17', '2022-01-05 13:44:17'),
(3, 1, 'Product', 2, 'uploads/products/993e914dd2/thumbnail/pj38wdqvic8yuec7t2ku', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641404756/uploads/products/993e914dd2/thumbnail/pj38wdqvic8yuec7t2ku.png', '2022-01-05 17:45:56', '2022-01-05 17:45:56'),
(4, 1, 'User', 1, 'uploads/users/c033abe93b/thumbnail/baovfdnvqwqqoh3isyuk', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641452947/uploads/users/c033abe93b/thumbnail/baovfdnvqwqqoh3isyuk.png', '2022-01-06 07:09:07', '2022-01-06 07:09:07');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `likeType` varchar(255) DEFAULT 'Merchant',
  `likedId` int(11) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `merchantcategories`
--

CREATE TABLE `merchantcategories` (
  `id` int(11) NOT NULL,
  `merchantDetailId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `merchantcategories`
--

INSERT INTO `merchantcategories` (`id`, `merchantDetailId`, `userId`, `categoryId`, `createdAt`, `updatedAt`) VALUES
(1, 1, 6, 1, '2022-01-05 13:22:09', '2022-01-05 13:22:09'),
(2, 2, 7, 2, '2022-01-05 13:22:13', '2022-01-05 13:22:13');

-- --------------------------------------------------------

--
-- Table structure for table `merchantDetails`
--

CREATE TABLE `merchantDetails` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `bussinessName` varchar(255) DEFAULT NULL,
  `storeName` varchar(255) DEFAULT NULL,
  `webSiteUrl` varchar(255) DEFAULT NULL,
  `merchantCode` varchar(255) DEFAULT NULL,
  `likes` int(11) DEFAULT '0',
  `receiveNotification` tinyint(1) DEFAULT '1',
  `lat` varchar(255) DEFAULT NULL,
  `lng` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `merchantDetails`
--

INSERT INTO `merchantDetails` (`id`, `userId`, `bussinessName`, `storeName`, `webSiteUrl`, `merchantCode`, `likes`, `receiveNotification`, `lat`, `lng`, `createdAt`, `updatedAt`) VALUES
(1, 6, 'Orgainc', 'Everglow store', 'https://everglowstore.com', 'abc123', 0, 1, '24.873880804406987', '67.05696344375612', '2022-01-05 13:22:07', '2022-01-05 13:22:07'),
(2, 7, 'Sports', 'Heaven store', 'https://heavenstore.com', 'xyz123', 0, 1, '24.873880804406987', '67.05696344375612', '2022-01-05 13:22:11', '2022-01-05 13:22:11');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `OrderId` varchar(255) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `merchantId` int(11) DEFAULT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `redeemeVoucherId` int(11) DEFAULT NULL,
  `statusId` int(11) DEFAULT '1',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `voucherId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `percentrates`
--

CREATE TABLE `percentrates` (
  `id` int(11) NOT NULL,
  `percentRate` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `canCreateAdmin` tinyint(1) DEFAULT NULL,
  `canReadAdmin` tinyint(1) DEFAULT NULL,
  `canUpdateAdmin` tinyint(1) DEFAULT NULL,
  `canDeleteAdmin` tinyint(1) DEFAULT NULL,
  `canBlockAdmin` tinyint(1) DEFAULT NULL,
  `canCreateMerchant` tinyint(1) DEFAULT NULL,
  `canReadMerchant` tinyint(1) DEFAULT NULL,
  `canBlockMerchant` tinyint(1) DEFAULT NULL,
  `canUpdateMerchant` tinyint(1) DEFAULT NULL,
  `canDeleteMerchant` tinyint(1) DEFAULT NULL,
  `canCreateUser` tinyint(1) DEFAULT NULL,
  `canBlockUser` tinyint(1) DEFAULT NULL,
  `canReadUser` tinyint(1) DEFAULT NULL,
  `canUpdateUser` tinyint(1) DEFAULT NULL,
  `canDeleteUser` tinyint(1) DEFAULT NULL,
  `canReadOwnAccount` tinyint(1) DEFAULT NULL,
  `canDeleteOwnAccount` tinyint(1) DEFAULT NULL,
  `canUpdateOwnAccount` tinyint(1) DEFAULT NULL,
  `canCreateCampion` tinyint(1) DEFAULT NULL,
  `canCreateProduct` tinyint(1) DEFAULT NULL,
  `canSeeCampion` tinyint(1) DEFAULT NULL,
  `canBlockCampion` tinyint(1) DEFAULT NULL,
  `canChatToMerchant` tinyint(1) DEFAULT NULL,
  `canSeeActivities` tinyint(1) DEFAULT NULL,
  `canDeleteProduct` tinyint(1) DEFAULT NULL,
  `canEditProduct` tinyint(1) DEFAULT NULL,
  `canReadProduct` tinyint(1) DEFAULT NULL,
  `canDeleteCategory` tinyint(1) DEFAULT NULL,
  `canReadCategory` tinyint(1) DEFAULT NULL,
  `canEditCategory` tinyint(1) DEFAULT NULL,
  `canReadPromoCode` tinyint(1) DEFAULT NULL,
  `canCreatePromoCode` tinyint(1) DEFAULT NULL,
  `canEditPromoCode` tinyint(1) DEFAULT NULL,
  `canDeletePromoCode` tinyint(1) DEFAULT NULL,
  `canBlockPromoCode` tinyint(1) DEFAULT NULL,
  `canBlockCategory` tinyint(1) DEFAULT NULL,
  `canBlockProduct` tinyint(1) DEFAULT NULL,
  `canReadVoucherHistory` tinyint(1) DEFAULT NULL,
  `canEditVoucherHistory` tinyint(1) DEFAULT NULL,
  `canBlockVoucherHistory` tinyint(1) DEFAULT NULL,
  `canDeleteVoucherHistory` tinyint(1) DEFAULT NULL,
  `canCreateVoucherHistory` tinyint(1) DEFAULT NULL,
  `canCreateCategory` tinyint(1) DEFAULT NULL,
  `canDeleteCampion` tinyint(1) DEFAULT NULL,
  `canReadSubCategory` tinyint(1) DEFAULT NULL,
  `canEditSubCategory` tinyint(1) DEFAULT NULL,
  `canBlockSubCategory` tinyint(1) DEFAULT NULL,
  `canDeleteSubCategory` tinyint(1) DEFAULT NULL,
  `canCreateSubCategory` tinyint(1) DEFAULT NULL,
  `canReadPaymentDetail` tinyint(1) DEFAULT NULL,
  `canEditPaymentDetail` tinyint(1) DEFAULT NULL,
  `canBlockPaymentDetail` tinyint(1) DEFAULT NULL,
  `canDeletePaymentDetail` tinyint(1) DEFAULT NULL,
  `canCreatePaymentDetail` tinyint(1) DEFAULT NULL,
  `canEditCampion` tinyint(1) DEFAULT NULL,
  `canReadTransactionDetail` tinyint(1) DEFAULT NULL,
  `canEditTransactionDetail` tinyint(1) DEFAULT NULL,
  `canBlockTransactionDetail` tinyint(1) DEFAULT NULL,
  `canDeleteTransactionDetail` tinyint(1) DEFAULT NULL,
  `canCreateTransactionDetail` tinyint(1) DEFAULT NULL,
  `canReadSupport` tinyint(1) DEFAULT NULL,
  `canEditSupport` tinyint(1) DEFAULT NULL,
  `canBlockSupport` tinyint(1) DEFAULT NULL,
  `canDeleteSupport` tinyint(1) DEFAULT NULL,
  `canCreateSupport` tinyint(1) DEFAULT NULL,
  `canReadTermsCondition` tinyint(1) DEFAULT NULL,
  `canEditTermsCondition` tinyint(1) DEFAULT NULL,
  `canBlockTermsCondition` tinyint(1) DEFAULT NULL,
  `canDeleteTermsCondition` tinyint(1) DEFAULT NULL,
  `canCreateTermsCondition` tinyint(1) DEFAULT NULL,
  `canReadActivityLog` tinyint(1) DEFAULT NULL,
  `canEditActivityLog` tinyint(1) DEFAULT NULL,
  `canBlockActivityLog` tinyint(1) DEFAULT NULL,
  `canDeleteActivityLog` tinyint(1) DEFAULT NULL,
  `canCreateActivityLog` tinyint(1) DEFAULT NULL,
  `canReadAboutUs` tinyint(1) DEFAULT NULL,
  `canEditAboutUs` tinyint(1) DEFAULT NULL,
  `canBlockAboutUs` tinyint(1) DEFAULT NULL,
  `canDeleteAboutUs` tinyint(1) DEFAULT NULL,
  `canCreateAboutUs` tinyint(1) DEFAULT NULL,
  `canReadContactUs` tinyint(1) DEFAULT NULL,
  `canEditContactUs` tinyint(1) DEFAULT NULL,
  `canBlockContactUs` tinyint(1) DEFAULT NULL,
  `canDeleteContactUs` tinyint(1) DEFAULT NULL,
  `canCreateContactUs` tinyint(1) DEFAULT NULL,
  `canReadActionRadius` tinyint(1) DEFAULT NULL,
  `canEditActionRadius` tinyint(1) DEFAULT NULL,
  `canBlockActionRadius` tinyint(1) DEFAULT NULL,
  `canDeleteActionRadius` tinyint(1) DEFAULT NULL,
  `canCreateActionRadius` tinyint(1) DEFAULT NULL,
  `canReadFaqs` tinyint(1) DEFAULT NULL,
  `canEditFaqs` tinyint(1) DEFAULT NULL,
  `canBlockFaqs` tinyint(1) DEFAULT NULL,
  `canDeleteFaqs` tinyint(1) DEFAULT NULL,
  `canCreateFaqs` tinyint(1) DEFAULT NULL,
  `canReadSalesTax` tinyint(1) DEFAULT NULL,
  `canEditSalesTax` tinyint(1) DEFAULT NULL,
  `canBlockSalesTax` tinyint(1) DEFAULT NULL,
  `canDeleteSalesTax` tinyint(1) DEFAULT NULL,
  `canCreateSalesTax` tinyint(1) DEFAULT NULL,
  `canReadPercentRate` tinyint(1) DEFAULT NULL,
  `canEditPercentRate` tinyint(1) DEFAULT NULL,
  `canBlockPercentRate` tinyint(1) DEFAULT NULL,
  `canDeletePercentRate` tinyint(1) DEFAULT NULL,
  `canCreatePercentRate` tinyint(1) DEFAULT NULL,
  `canReadAdditionalFees` tinyint(1) DEFAULT NULL,
  `canEditAdditionalFees` tinyint(1) DEFAULT NULL,
  `canBlockAdditionalFees` tinyint(1) DEFAULT NULL,
  `canDeleteAdditionalFees` tinyint(1) DEFAULT NULL,
  `canCreateAdditionalFees` tinyint(1) DEFAULT NULL,
  `canReadAppBanners` tinyint(1) DEFAULT NULL,
  `canEditAppBanners` tinyint(1) DEFAULT NULL,
  `canBlockAppBanners` tinyint(1) DEFAULT NULL,
  `canDeleteAppBanners` tinyint(1) DEFAULT NULL,
  `canCreateAppBanners` tinyint(1) DEFAULT NULL,
  `canReadHowToUse` tinyint(1) DEFAULT NULL,
  `canEditHowToUse` tinyint(1) DEFAULT NULL,
  `canBlockHowToUse` tinyint(1) DEFAULT NULL,
  `canDeleteHowToUse` tinyint(1) DEFAULT NULL,
  `canCreateHowToUse` tinyint(1) DEFAULT NULL,
  `canReadRedemptions` tinyint(1) DEFAULT NULL,
  `canUpdateRedemptions` tinyint(1) DEFAULT NULL,
  `canDeleteRedemptions` tinyint(1) DEFAULT NULL,
  `canReadSale` tinyint(1) DEFAULT NULL,
  `canUpdateSale` tinyint(1) DEFAULT NULL,
  `canDeleteSale` tinyint(1) DEFAULT NULL,
  `canCreateCounter` tinyint(1) DEFAULT NULL,
  `canReadCounter` tinyint(1) DEFAULT NULL,
  `canUpdateCounter` tinyint(1) DEFAULT NULL,
  `canCreatePrivacyPolicy` tinyint(1) DEFAULT NULL,
  `canReadPrivacyPolicy` tinyint(1) DEFAULT NULL,
  `canUpdatePrivacyPolicy` tinyint(1) DEFAULT NULL,
  `canDeletePrivacyPolicy` tinyint(1) DEFAULT NULL,
  `canCreateContactService` tinyint(1) DEFAULT NULL,
  `canDeleteContactService` tinyint(1) DEFAULT NULL,
  `canEditContactService` tinyint(1) DEFAULT NULL,
  `canReadContactService` tinyint(1) DEFAULT NULL,
  `canCreateQuestion` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `userId`, `roleId`, `canCreateAdmin`, `canReadAdmin`, `canUpdateAdmin`, `canDeleteAdmin`, `canBlockAdmin`, `canCreateMerchant`, `canReadMerchant`, `canBlockMerchant`, `canUpdateMerchant`, `canDeleteMerchant`, `canCreateUser`, `canBlockUser`, `canReadUser`, `canUpdateUser`, `canDeleteUser`, `canReadOwnAccount`, `canDeleteOwnAccount`, `canUpdateOwnAccount`, `canCreateCampion`, `canCreateProduct`, `canSeeCampion`, `canBlockCampion`, `canChatToMerchant`, `canSeeActivities`, `canDeleteProduct`, `canEditProduct`, `canReadProduct`, `canDeleteCategory`, `canReadCategory`, `canEditCategory`, `canReadPromoCode`, `canCreatePromoCode`, `canEditPromoCode`, `canDeletePromoCode`, `canBlockPromoCode`, `canBlockCategory`, `canBlockProduct`, `canReadVoucherHistory`, `canEditVoucherHistory`, `canBlockVoucherHistory`, `canDeleteVoucherHistory`, `canCreateVoucherHistory`, `canCreateCategory`, `canDeleteCampion`, `canReadSubCategory`, `canEditSubCategory`, `canBlockSubCategory`, `canDeleteSubCategory`, `canCreateSubCategory`, `canReadPaymentDetail`, `canEditPaymentDetail`, `canBlockPaymentDetail`, `canDeletePaymentDetail`, `canCreatePaymentDetail`, `canEditCampion`, `canReadTransactionDetail`, `canEditTransactionDetail`, `canBlockTransactionDetail`, `canDeleteTransactionDetail`, `canCreateTransactionDetail`, `canReadSupport`, `canEditSupport`, `canBlockSupport`, `canDeleteSupport`, `canCreateSupport`, `canReadTermsCondition`, `canEditTermsCondition`, `canBlockTermsCondition`, `canDeleteTermsCondition`, `canCreateTermsCondition`, `canReadActivityLog`, `canEditActivityLog`, `canBlockActivityLog`, `canDeleteActivityLog`, `canCreateActivityLog`, `canReadAboutUs`, `canEditAboutUs`, `canBlockAboutUs`, `canDeleteAboutUs`, `canCreateAboutUs`, `canReadContactUs`, `canEditContactUs`, `canBlockContactUs`, `canDeleteContactUs`, `canCreateContactUs`, `canReadActionRadius`, `canEditActionRadius`, `canBlockActionRadius`, `canDeleteActionRadius`, `canCreateActionRadius`, `canReadFaqs`, `canEditFaqs`, `canBlockFaqs`, `canDeleteFaqs`, `canCreateFaqs`, `canReadSalesTax`, `canEditSalesTax`, `canBlockSalesTax`, `canDeleteSalesTax`, `canCreateSalesTax`, `canReadPercentRate`, `canEditPercentRate`, `canBlockPercentRate`, `canDeletePercentRate`, `canCreatePercentRate`, `canReadAdditionalFees`, `canEditAdditionalFees`, `canBlockAdditionalFees`, `canDeleteAdditionalFees`, `canCreateAdditionalFees`, `canReadAppBanners`, `canEditAppBanners`, `canBlockAppBanners`, `canDeleteAppBanners`, `canCreateAppBanners`, `canReadHowToUse`, `canEditHowToUse`, `canBlockHowToUse`, `canDeleteHowToUse`, `canCreateHowToUse`, `canReadRedemptions`, `canUpdateRedemptions`, `canDeleteRedemptions`, `canReadSale`, `canUpdateSale`, `canDeleteSale`, `canCreateCounter`, `canReadCounter`, `canUpdateCounter`, `canCreatePrivacyPolicy`, `canReadPrivacyPolicy`, `canUpdatePrivacyPolicy`, `canDeletePrivacyPolicy`, `canCreateContactService`, `canDeleteContactService`, `canEditContactService`, `canReadContactService`, `canCreateQuestion`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NULL, '2022-01-05 13:21:42', '2022-01-05 13:21:42'),
(2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2022-01-05 13:21:44', '2022-01-05 13:21:44'),
(3, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2022-01-05 13:21:47', '2022-01-05 13:21:47'),
(4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2022-01-05 13:21:49', '2022-01-05 13:21:49'),
(5, 5, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 1, 1, '2022-01-05 13:21:51', '2022-01-05 13:21:51'),
(6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 0, NULL, '2022-01-05 13:21:52', '2022-01-05 13:21:52'),
(7, 7, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, 0, NULL, '2022-01-05 13:21:56', '2022-01-05 13:21:56');

-- --------------------------------------------------------

--
-- Table structure for table `privacypolicies`
--

CREATE TABLE `privacypolicies` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `isActive` tinyint(1) DEFAULT '1',
  `isDelete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `subcategoryId` int(11) DEFAULT NULL,
  `merchantId` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `short_title` varchar(255) DEFAULT NULL,
  `long_title` varchar(255) DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `long_description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `categoryId`, `subcategoryId`, `merchantId`, `stock`, `short_title`, `long_title`, `short_description`, `long_description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'new product', 1, 1, 6, 199000, 'new', 'new', 'new', 'new', 1, '2022-01-05 13:42:33', '2022-01-05 13:44:17'),
(2, 'asdas', 1, 1, 6, 12, 'zczxc', 'zxczxc', 'zxczxc', 'zxczxczxc', 1, '2022-01-05 17:45:56', '2022-01-05 17:45:56');

-- --------------------------------------------------------

--
-- Table structure for table `promoCodes`
--

CREATE TABLE `promoCodes` (
  `id` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `discount` varchar(255) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `limit` int(11) DEFAULT '1',
  `expireAt` varchar(255) DEFAULT NULL,
  `discountType` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `redeemeVouchers`
--

CREATE TABLE `redeemeVouchers` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `campaignId` int(11) NOT NULL,
  `voucherId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phonenumber` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `address2` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `postalcode` varchar(255) DEFAULT NULL,
  `emailId` varchar(255) DEFAULT NULL,
  `instruction` varchar(255) DEFAULT NULL,
  `redeemeDevOpId` int(11) NOT NULL,
  `redeemeDevTypeId` int(11) DEFAULT '3',
  `statusId` int(11) NOT NULL DEFAULT '4',
  `isActive` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `roleName` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `roleName`, `createdAt`, `updatedAt`) VALUES
(1, 'Super Admin', '2022-01-05 13:21:25', '2022-01-05 13:21:25'),
(2, 'Admin', '2022-01-05 13:21:26', '2022-01-05 13:21:26'),
(3, 'Merchant', '2022-01-05 13:21:27', '2022-01-05 13:21:27'),
(4, 'User', '2022-01-05 13:21:28', '2022-01-05 13:21:28');

-- --------------------------------------------------------

--
-- Table structure for table `saletaxes`
--

CREATE TABLE `saletaxes` (
  `id` int(11) NOT NULL,
  `saletax` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `shippings`
--

CREATE TABLE `shippings` (
  `id` int(11) NOT NULL,
  `ShippingName` varchar(255) DEFAULT NULL,
  `curbsite` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `shippings`
--

INSERT INTO `shippings` (`id`, `ShippingName`, `curbsite`, `createdAt`, `updatedAt`) VALUES
(1, 'delivery', 0, '2022-01-05 13:21:18', '2022-01-05 13:21:18'),
(2, 'delivery/pickup', 1, '2022-01-05 13:21:20', '2022-01-05 13:21:20'),
(3, 'pickup', 1, '2022-01-05 13:21:20', '2022-01-05 13:21:20');

-- --------------------------------------------------------

--
-- Table structure for table `sliders`
--

CREATE TABLE `sliders` (
  `id` int(11) NOT NULL,
  `imageType` varchar(255) DEFAULT NULL,
  `typeId` int(11) DEFAULT NULL,
  `imageId` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `sliderIndex` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `sliders`
--

INSERT INTO `sliders` (`id`, `imageType`, `typeId`, `imageId`, `imageUrl`, `sliderIndex`, `createdAt`, `updatedAt`) VALUES
(1, 'Product', 1, 'uploads/products/e1f2d2ab15/thumbnail/yaxm6xrezubunegwnwsi', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641390153/uploads/products/e1f2d2ab15/thumbnail/yaxm6xrezubunegwnwsi.png', 0, '2022-01-05 13:42:33', '2022-01-05 13:42:33'),
(2, 'Campaign', 1, 'uploads/campaigns/59d45a1dd1/thumbnail/de2rbpu1zjvx49epe2eq', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641390256/uploads/campaigns/59d45a1dd1/thumbnail/de2rbpu1zjvx49epe2eq.png', 0, '2022-01-05 13:44:17', '2022-01-05 13:44:17'),
(3, 'Product', 2, 'uploads/products/993e914dd2/thumbnail/pj38wdqvic8yuec7t2ku', 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641404756/uploads/products/993e914dd2/thumbnail/pj38wdqvic8yuec7t2ku.png', 0, '2022-01-05 17:45:56', '2022-01-05 17:45:56');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `isDelete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`id`, `categoryId`, `name`, `description`, `image`, `isActive`, `isDelete`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Hair Products', 'new products available', NULL, 1, 0, '2022-01-05 13:22:00', '2022-01-05 13:22:00'),
(2, 2, 'Shoes Products', 'new products available', NULL, 1, 0, '2022-01-05 13:22:05', '2022-01-05 13:22:05');

-- --------------------------------------------------------

--
-- Table structure for table `supports`
--

CREATE TABLE `supports` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `number` varchar(255) DEFAULT NULL,
  `question` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `termsconditions`
--

CREATE TABLE `termsconditions` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `terms` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `transactionDetails`
--

CREATE TABLE `transactionDetails` (
  `id` int(11) NOT NULL,
  `transactionId` int(11) DEFAULT NULL,
  `transactionCode` varchar(255) DEFAULT NULL,
  `campaignId` varchar(255) DEFAULT NULL,
  `camName` varchar(255) DEFAULT NULL,
  `campAmount` int(11) DEFAULT NULL,
  `voucherRange` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `transactionDetails`
--

INSERT INTO `transactionDetails` (`id`, `transactionId`, `transactionCode`, `campaignId`, `camName`, `campAmount`, `voucherRange`, `createdAt`, `updatedAt`) VALUES
(1, 1, '1D1Y1CREX5', '1', 'new campaign', 200, '1-20', '2022-01-05 13:49:25', '2022-01-05 13:49:25');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `netAmount` float DEFAULT NULL,
  `discount` float DEFAULT NULL,
  `paymentType` varchar(255) DEFAULT NULL,
  `paymentId` varchar(255) DEFAULT NULL,
  `transactionCode` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `userId`, `netAmount`, `discount`, `paymentType`, `paymentId`, `transactionCode`, `createdAt`, `updatedAt`) VALUES
(1, 4, 200, 0, 'stripe', 'ch_3KEZrkGLAlRrYYL51UhPbvQy', '1D1Y1CREX5', '2022-01-05 13:49:25', '2022-01-05 13:49:25');

-- --------------------------------------------------------

--
-- Table structure for table `updatedSalTaxes`
--

CREATE TABLE `updatedSalTaxes` (
  `id` int(11) NOT NULL,
  `userId` varchar(255) DEFAULT NULL,
  `saleTax` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `userType` varchar(255) DEFAULT 'custom',
  `emailVerified` tinyint(1) DEFAULT '0',
  `otpVerified` tinyint(1) DEFAULT '0',
  `isBlocked` tinyint(1) DEFAULT '0',
  `isDelete` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userName`, `email`, `password`, `userType`, `emailVerified`, `otpVerified`, `isBlocked`, `isDelete`, `createdAt`, `updatedAt`) VALUES
(1, 'givees', 'superadmin@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrObCV4md8U3XvAsrNjlJQ29tMPfNuyWLG', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:39', '2022-01-06 07:09:07'),
(2, 'Atif007', 'atif@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:43', '2022-01-05 13:21:43'),
(3, 'Omer007', 'Omer@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:45', '2022-01-05 13:21:45'),
(4, 'Asma007', 'Asma@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:48', '2022-01-05 13:21:48'),
(5, 'Usher007', 'Usher@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:49', '2022-01-05 13:21:49'),
(6, 'Ikram007', 'Ikram@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:51', '2022-01-05 13:21:51'),
(7, 'Ali007', 'Ali@givees.com', '$2b$10$JJRYfyS6D85IEHhwaxwCrOVYHq8gHY4KI/cMVX0C5GjqglW93jxqW', 'custom', 1, 0, 0, 0, '2022-01-05 13:21:53', '2022-01-05 13:21:53');

-- --------------------------------------------------------

--
-- Table structure for table `usersdetails`
--

CREATE TABLE `usersdetails` (
  `id` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zipCode` varchar(255) DEFAULT NULL,
  `dob` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `phoneCountry` varchar(255) DEFAULT NULL,
  `about` varchar(255) DEFAULT NULL,
  `imagePath` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `public_profile` tinyint(1) DEFAULT '1',
  `bio` text,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `usersdetails`
--

INSERT INTO `usersdetails` (`id`, `firstName`, `lastName`, `address`, `street`, `country`, `city`, `state`, `zipCode`, `dob`, `phoneNumber`, `phoneCountry`, `about`, `imagePath`, `gender`, `public_profile`, `bio`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 'Givees', 'Givees', NULL, NULL, NULL, NULL, NULL, NULL, 'null', 'null', NULL, NULL, 'http://res.cloudinary.com/dpc1ztgte/image/upload/v1641452947/uploads/users/c033abe93b/thumbnail/baovfdnvqwqqoh3isyuk.png', NULL, 1, NULL, 1, '2022-01-05 13:21:41', '2022-01-06 07:09:07'),
(2, 'Atif', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 2, '2022-01-05 13:21:44', '2022-01-05 13:21:44'),
(3, 'Omer', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 3, '2022-01-05 13:21:45', '2022-01-05 13:21:45'),
(4, 'Asma', 'Givees', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 4, '2022-01-05 13:21:48', '2022-01-05 13:21:48'),
(5, 'Usher', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 5, '2022-01-05 13:21:50', '2022-01-05 13:21:50'),
(6, 'Ikram', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 6, '2022-01-05 13:21:52', '2022-01-05 13:21:52'),
(7, 'Ali', 'Khan', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, 7, '2022-01-05 13:21:54', '2022-01-05 13:21:54');

-- --------------------------------------------------------

--
-- Table structure for table `vouchergens`
--

CREATE TABLE `vouchergens` (
  `id` int(11) NOT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `voucherCode` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `pending` int(11) DEFAULT '0',
  `expiresAt` varchar(255) DEFAULT NULL,
  `isExpired` tinyint(1) DEFAULT '0',
  `transactionDetailId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `vouchergens`
--

INSERT INTO `vouchergens` (`id`, `campaignId`, `productId`, `userId`, `voucherCode`, `isActive`, `pending`, `expiresAt`, `isExpired`, `transactionDetailId`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 4, '5YX4158XY4', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(2, 1, 1, 4, '4EPTXD2C80', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(3, 1, 1, 4, 'UUEUM2CKK1', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(4, 1, 1, 4, '2CWKM41KXK', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(5, 1, 1, 4, 'YMPYM1PYC0', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(6, 1, 1, 4, '02T2KHUE14', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(7, 1, 1, 4, 'TD4E0RUCU2', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(8, 1, 1, 4, 'MM28EDTPH2', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(9, 1, 1, 4, '2U4MWR2R2Y', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(10, 1, 1, 4, 'U502Y8UWR0', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(11, 1, 1, 4, '085PHUMHTW', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(12, 1, 1, 4, 'CTWYEUXUWH', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(13, 1, 1, 4, 'HXTE5WD25K', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(14, 1, 1, 4, '8HP2EUX82R', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(15, 1, 1, 4, '58H802MCYM', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(16, 1, 1, 4, 'TMX0DRW8K4', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(17, 1, 1, 4, '8PP0DR5TC8', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(18, 1, 1, 4, '5MMDHT2HM2', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(19, 1, 1, 4, 'HEDYW0K2U1', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(20, 1, 1, 4, '5PRT8Y200K', 1, 0, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 13:49:25'),
(21, 1, 1, 3, '5YX4158XY4', 1, 1, '2022-02-01T18:43:57', 0, 1, '2022-01-05 13:49:25', '2022-01-05 16:25:20');

-- --------------------------------------------------------

--
-- Table structure for table `voucherMerchantRedeemes`
--

CREATE TABLE `voucherMerchantRedeemes` (
  `id` int(11) NOT NULL,
  `merchantId` int(11) NOT NULL,
  `redeemeVoucherId` int(11) NOT NULL,
  `statusId` int(11) DEFAULT '1',
  `deliveryTime` varchar(255) DEFAULT NULL,
  `redeemeDevOpId` int(11) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `voucherSharings`
--

CREATE TABLE `voucherSharings` (
  `id` int(11) NOT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `senderId` int(11) DEFAULT NULL,
  `receiverId` int(11) DEFAULT NULL,
  `voucherCode` varchar(255) DEFAULT NULL,
  `voucherQty` varchar(255) DEFAULT '1',
  `isActive` tinyint(1) DEFAULT '0',
  `vouchergenId` int(11) DEFAULT NULL,
  `referenceId` int(11) DEFAULT NULL,
  `personalNote` varchar(255) DEFAULT NULL,
  `pending` tinyint(1) DEFAULT '1',
  `statusId` int(11) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `voucherSharings`
--

INSERT INTO `voucherSharings` (`id`, `campaignId`, `productId`, `senderId`, `receiverId`, `voucherCode`, `voucherQty`, `isActive`, `vouchergenId`, `referenceId`, `personalNote`, `pending`, `statusId`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 4, 3, '5YX4158XY4', '1', 0, 21, 1, '', 1, 1, '2022-01-05 16:25:20', '2022-01-05 16:25:20');

-- --------------------------------------------------------

--
-- Table structure for table `voucherStatuses`
--

CREATE TABLE `voucherStatuses` (
  `id` int(11) NOT NULL,
  `status` varchar(255) NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `voucherStatuses`
--

INSERT INTO `voucherStatuses` (`id`, `status`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Pending', 1, '2022-01-05 13:23:52', '2022-01-05 13:21:29'),
(2, 'Approved', 1, '2022-01-05 13:23:53', '2022-01-05 13:21:30'),
(3, 'Declined', 1, '2022-01-05 13:23:53', '2022-01-05 13:21:30'),
(4, 'Processing', 1, '2022-01-05 13:23:54', '2022-01-05 13:21:31'),
(5, 'Delivered', 1, '2022-01-05 13:23:55', '2022-01-05 13:21:32');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `campaignId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `abouts`
--
ALTER TABLE `abouts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `actionradius`
--
ALTER TABLE `actionradius`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `addtocarts`
--
ALTER TABLE `addtocarts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `campaingId` (`campaingId`);

--
-- Indexes for table `appbanners`
--
ALTER TABLE `appbanners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaingId` (`campaingId`),
  ADD KEY `bannerType` (`bannerType`);

--
-- Indexes for table `appbannertypes`
--
ALTER TABLE `appbannertypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `appliedPromocodes`
--
ALTER TABLE `appliedPromocodes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `BlockUsers`
--
ALTER TABLE `BlockUsers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `blockerId` (`blockerId`),
  ADD KEY `blockedId` (`blockedId`);

--
-- Indexes for table `campaignDetails`
--
ALTER TABLE `campaignDetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `campaignLikes`
--
ALTER TABLE `campaignLikes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `likedId` (`likedId`);

--
-- Indexes for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `merchantId` (`merchantId`),
  ADD KEY `shippingStatus` (`shippingStatus`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contactservices`
--
ALTER TABLE `contactservices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contactUsInfos`
--
ALTER TABLE `contactUsInfos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service` (`service`);

--
-- Indexes for table `deliveryOptions`
--
ALTER TABLE `deliveryOptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deliveryTypes`
--
ALTER TABLE `deliveryTypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emailverifications`
--
ALTER TABLE `emailverifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `exceptions`
--
ALTER TABLE `exceptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `faqs`
--
ALTER TABLE `faqs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forgetPasswords`
--
ALTER TABLE `forgetPasswords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`id`),
  ADD KEY `senderId` (`senderId`),
  ADD KEY `receiverId` (`receiverId`);

--
-- Indexes for table `globalCounters`
--
ALTER TABLE `globalCounters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `howtouses`
--
ALTER TABLE `howtouses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `imagedata`
--
ALTER TABLE `imagedata`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `likedId` (`likedId`);

--
-- Indexes for table `merchantcategories`
--
ALTER TABLE `merchantcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `merchantDetailId` (`merchantDetailId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `merchantDetails`
--
ALTER TABLE `merchantDetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `merchantId` (`merchantId`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `redeemeVoucherId` (`redeemeVoucherId`),
  ADD KEY `statusId` (`statusId`),
  ADD KEY `voucherId` (`voucherId`);

--
-- Indexes for table `percentrates`
--
ALTER TABLE `percentrates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `roleId` (`roleId`);

--
-- Indexes for table `privacypolicies`
--
ALTER TABLE `privacypolicies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`),
  ADD KEY `subcategoryId` (`subcategoryId`),
  ADD KEY `merchantId` (`merchantId`);

--
-- Indexes for table `promoCodes`
--
ALTER TABLE `promoCodes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `redeemeVouchers`
--
ALTER TABLE `redeemeVouchers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `voucherId` (`voucherId`),
  ADD KEY `redeemeDevOpId` (`redeemeDevOpId`),
  ADD KEY `redeemeDevTypeId` (`redeemeDevTypeId`),
  ADD KEY `statusId` (`statusId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saletaxes`
--
ALTER TABLE `saletaxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `shippings`
--
ALTER TABLE `shippings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sliders`
--
ALTER TABLE `sliders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `supports`
--
ALTER TABLE `supports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `termsconditions`
--
ALTER TABLE `termsconditions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactionDetails`
--
ALTER TABLE `transactionDetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transactionId` (`transactionId`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `updatedSalTaxes`
--
ALTER TABLE `updatedSalTaxes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usersdetails`
--
ALTER TABLE `usersdetails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `vouchergens`
--
ALTER TABLE `vouchergens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `productId` (`productId`),
  ADD KEY `userId` (`userId`),
  ADD KEY `transactionDetailId` (`transactionDetailId`);

--
-- Indexes for table `voucherMerchantRedeemes`
--
ALTER TABLE `voucherMerchantRedeemes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `redeemeVoucherId` (`redeemeVoucherId`),
  ADD KEY `statusId` (`statusId`),
  ADD KEY `redeemeDevOpId` (`redeemeDevOpId`);

--
-- Indexes for table `voucherSharings`
--
ALTER TABLE `voucherSharings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `productId` (`productId`),
  ADD KEY `senderId` (`senderId`),
  ADD KEY `receiverId` (`receiverId`),
  ADD KEY `vouchergenId` (`vouchergenId`),
  ADD KEY `referenceId` (`referenceId`),
  ADD KEY `statusId` (`statusId`);

--
-- Indexes for table `voucherStatuses`
--
ALTER TABLE `voucherStatuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campaignId` (`campaignId`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `abouts`
--
ALTER TABLE `abouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `actionradius`
--
ALTER TABLE `actionradius`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `addtocarts`
--
ALTER TABLE `addtocarts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appbanners`
--
ALTER TABLE `appbanners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appbannertypes`
--
ALTER TABLE `appbannertypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `appliedPromocodes`
--
ALTER TABLE `appliedPromocodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `BlockUsers`
--
ALTER TABLE `BlockUsers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaignDetails`
--
ALTER TABLE `campaignDetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `campaignLikes`
--
ALTER TABLE `campaignLikes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campaigns`
--
ALTER TABLE `campaigns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contactservices`
--
ALTER TABLE `contactservices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contactUsInfos`
--
ALTER TABLE `contactUsInfos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deliveryOptions`
--
ALTER TABLE `deliveryOptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `deliveryTypes`
--
ALTER TABLE `deliveryTypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `emailverifications`
--
ALTER TABLE `emailverifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exceptions`
--
ALTER TABLE `exceptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faqs`
--
ALTER TABLE `faqs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forgetPasswords`
--
ALTER TABLE `forgetPasswords`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `globalCounters`
--
ALTER TABLE `globalCounters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `howtouses`
--
ALTER TABLE `howtouses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `imagedata`
--
ALTER TABLE `imagedata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `merchantcategories`
--
ALTER TABLE `merchantcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `merchantDetails`
--
ALTER TABLE `merchantDetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `percentrates`
--
ALTER TABLE `percentrates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `privacypolicies`
--
ALTER TABLE `privacypolicies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `promoCodes`
--
ALTER TABLE `promoCodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `redeemeVouchers`
--
ALTER TABLE `redeemeVouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `saletaxes`
--
ALTER TABLE `saletaxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shippings`
--
ALTER TABLE `shippings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sliders`
--
ALTER TABLE `sliders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `supports`
--
ALTER TABLE `supports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `termsconditions`
--
ALTER TABLE `termsconditions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactionDetails`
--
ALTER TABLE `transactionDetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `updatedSalTaxes`
--
ALTER TABLE `updatedSalTaxes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `usersdetails`
--
ALTER TABLE `usersdetails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vouchergens`
--
ALTER TABLE `vouchergens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `voucherMerchantRedeemes`
--
ALTER TABLE `voucherMerchantRedeemes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `voucherSharings`
--
ALTER TABLE `voucherSharings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `voucherStatuses`
--
ALTER TABLE `voucherStatuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addtocarts`
--
ALTER TABLE `addtocarts`
  ADD CONSTRAINT `addtocarts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `addtocarts_ibfk_2` FOREIGN KEY (`campaingId`) REFERENCES `campaigns` (`id`);

--
-- Constraints for table `appbanners`
--
ALTER TABLE `appbanners`
  ADD CONSTRAINT `appbanners_ibfk_1` FOREIGN KEY (`campaingId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appbanners_ibfk_2` FOREIGN KEY (`bannerType`) REFERENCES `appbannertypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `BlockUsers`
--
ALTER TABLE `BlockUsers`
  ADD CONSTRAINT `BlockUsers_ibfk_1` FOREIGN KEY (`blockerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `BlockUsers_ibfk_2` FOREIGN KEY (`blockedId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `campaignDetails`
--
ALTER TABLE `campaignDetails`
  ADD CONSTRAINT `campaignDetails_ibfk_1` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `campaignDetails_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `campaignLikes`
--
ALTER TABLE `campaignLikes`
  ADD CONSTRAINT `campaignLikes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `campaignLikes_ibfk_2` FOREIGN KEY (`likedId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `campaigns`
--
ALTER TABLE `campaigns`
  ADD CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`merchantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `campaigns_ibfk_2` FOREIGN KEY (`shippingStatus`) REFERENCES `shippings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contactUsInfos`
--
ALTER TABLE `contactUsInfos`
  ADD CONSTRAINT `contactUsInfos_ibfk_1` FOREIGN KEY (`service`) REFERENCES `contactservices` (`id`);

--
-- Constraints for table `emailverifications`
--
ALTER TABLE `emailverifications`
  ADD CONSTRAINT `emailverifications_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `exceptions`
--
ALTER TABLE `exceptions`
  ADD CONSTRAINT `exceptions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `forgetPasswords`
--
ALTER TABLE `forgetPasswords`
  ADD CONSTRAINT `forgetPasswords_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `imagedata`
--
ALTER TABLE `imagedata`
  ADD CONSTRAINT `imagedata_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`likedId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `merchantcategories`
--
ALTER TABLE `merchantcategories`
  ADD CONSTRAINT `merchantcategories_ibfk_1` FOREIGN KEY (`merchantDetailId`) REFERENCES `merchantDetails` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `merchantcategories_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `merchantcategories_ibfk_3` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `merchantDetails`
--
ALTER TABLE `merchantDetails`
  ADD CONSTRAINT `merchantDetails_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`merchantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`redeemeVoucherId`) REFERENCES `redeemeVouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`statusId`) REFERENCES `voucherStatuses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_6` FOREIGN KEY (`voucherId`) REFERENCES `vouchergens` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`subcategoryId`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`merchantId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `redeemeVouchers`
--
ALTER TABLE `redeemeVouchers`
  ADD CONSTRAINT `redeemeVouchers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `redeemeVouchers_ibfk_2` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `redeemeVouchers_ibfk_3` FOREIGN KEY (`voucherId`) REFERENCES `vouchergens` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `redeemeVouchers_ibfk_4` FOREIGN KEY (`redeemeDevOpId`) REFERENCES `deliveryOptions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `redeemeVouchers_ibfk_5` FOREIGN KEY (`redeemeDevTypeId`) REFERENCES `deliveryTypes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `redeemeVouchers_ibfk_6` FOREIGN KEY (`statusId`) REFERENCES `voucherStatuses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supports`
--
ALTER TABLE `supports`
  ADD CONSTRAINT `supports_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);

--
-- Constraints for table `transactionDetails`
--
ALTER TABLE `transactionDetails`
  ADD CONSTRAINT `transactionDetails_ibfk_1` FOREIGN KEY (`transactionId`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usersdetails`
--
ALTER TABLE `usersdetails`
  ADD CONSTRAINT `usersdetails_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vouchergens`
--
ALTER TABLE `vouchergens`
  ADD CONSTRAINT `vouchergens_ibfk_1` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vouchergens_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `vouchergens_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `vouchergens_ibfk_4` FOREIGN KEY (`transactionDetailId`) REFERENCES `transactionDetails` (`id`);

--
-- Constraints for table `voucherMerchantRedeemes`
--
ALTER TABLE `voucherMerchantRedeemes`
  ADD CONSTRAINT `voucherMerchantRedeemes_ibfk_1` FOREIGN KEY (`redeemeVoucherId`) REFERENCES `redeemeVouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `voucherMerchantRedeemes_ibfk_2` FOREIGN KEY (`statusId`) REFERENCES `voucherStatuses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `voucherMerchantRedeemes_ibfk_3` FOREIGN KEY (`redeemeDevOpId`) REFERENCES `deliveryOptions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `voucherSharings`
--
ALTER TABLE `voucherSharings`
  ADD CONSTRAINT `voucherSharings_ibfk_1` FOREIGN KEY (`campaignId`) REFERENCES `vouchergens` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `voucherSharings_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `voucherSharings_ibfk_3` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `voucherSharings_ibfk_4` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `voucherSharings_ibfk_5` FOREIGN KEY (`vouchergenId`) REFERENCES `vouchergens` (`id`),
  ADD CONSTRAINT `voucherSharings_ibfk_6` FOREIGN KEY (`referenceId`) REFERENCES `vouchergens` (`id`),
  ADD CONSTRAINT `voucherSharings_ibfk_7` FOREIGN KEY (`statusId`) REFERENCES `voucherStatuses` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
