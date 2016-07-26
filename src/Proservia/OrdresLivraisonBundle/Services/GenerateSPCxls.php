<?php
namespace Proservia\OrdresLivraisonBundle\Services;

use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use PHPExcel_Style_Alignment;
use PHPExcel_Style_Font;
use PHPExcel_Style_Color;
use PHPExcel_Style_Border;
use Liuggio\ExcelBundle\Factory as phpexcelfactory;

/**
 * Class GenerateSPCxls
 * @package Proservia\OrdresLivraisonBundle\Services
 */
class GenerateSPCxls extends AbstractGenerateXls
{

    public function GenerateSPCxls($name, $site, $fixe1, $fixe2, $fixeBoost1, $fixeBoost2, $portable1, $portable2, $portableBoost1, $comments)
    {
        $siteDetail = $this->siteManager->load($site);
        $contact1   = $this->contactManager->load($siteDetail->getContact1());
        $contact2   = $this->contactManager->load($siteDetail->getContact2());

        // ask the service for a Excel5
        $phpExcelObjectFactory = new phpexcelfactory();
        $phpExcelObject = $phpExcelObjectFactory->createPHPExcelObject();

        $phpExcelObject->getProperties()->setCreator("Pilotage Module D")
            ->setLastModifiedBy("Pilotage Module D")
            ->setTitle($name)
            ->setSubject($name)
            ->setDescription("Ordre de Livraison du ".date('d/m/Y'))
            ->setKeywords("office 2005 openxml php")
            ->setCategory($name);

        $phpExcelObject->setActiveSheetIndex(0);

        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('0')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('1')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('2')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('3')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('4')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('5')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('6')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('7')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('8')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('9')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('10')->setAutoSize(false);
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('11')->setAutoSize(false);

        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('0')->setWidth('0.33');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('1')->setWidth('3.71');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('2')->setWidth('76.71');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('3')->setWidth('0.58');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('4')->setWidth('50.29');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('5')->setWidth('0.50');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('6')->setWidth('14');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('7')->setWidth('23.29');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('8')->setWidth('0.75');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('9')->setWidth('16.43');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('10')->setWidth('9.14');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('11')->setWidth('7');

        $phpExcelObject->getActiveSheet()->getRowDimension(1)->setRowHeight('5.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(2)->setRowHeight('45.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(3)->setRowHeight('47.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(4)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(5)->setRowHeight('4.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(6)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(7)->setRowHeight('4.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(8)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(9)->setRowHeight('4.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(10)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(11)->setRowHeight('4.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(12)->setRowHeight('56.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(13)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(14)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(15)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(16)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(17)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(18)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(19)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(20)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(21)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(22)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(23)->setRowHeight('30');
        $phpExcelObject->getActiveSheet()->getRowDimension(24)->setRowHeight('9');
        $phpExcelObject->getActiveSheet()->getRowDimension(25)->setRowHeight('15.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(26)->setRowHeight('4.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(27)->setRowHeight('41.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(28)->setRowHeight('32.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(29)->setRowHeight('141.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(30)->setRowHeight('138');
        $phpExcelObject->getActiveSheet()->getRowDimension(31)->setRowHeight('32.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(32)->setRowHeight('141.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(33)->setRowHeight('137.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(34)->setRowHeight('32.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(35)->setRowHeight('136.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(36)->setRowHeight('118.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(37)->setRowHeight('32.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(38)->setRowHeight('118.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(39)->setRowHeight('15');
        $phpExcelObject->getActiveSheet()->getRowDimension(40)->setRowHeight('5');
        $phpExcelObject->getActiveSheet()->getRowDimension(41)->setRowHeight('20.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(42)->setRowHeight('28.5');
        $phpExcelObject->getActiveSheet()->getRowDimension(43)->setRowHeight('6');
        $phpExcelObject->getActiveSheet()->getRowDimension(44)->setRowHeight('114');
        $phpExcelObject->getActiveSheet()->getRowDimension(45)->setRowHeight('28.5');

        $phpExcelObject->getActiveSheet()->getSheetView()->setZoomScale(55);

        $phpExcelObject->getActiveSheet()->setTitle('OL'.date('ymd').'ECR');

        $phpExcelObject->getActiveSheet()->getStyle('B2:L46')->applyFromArray(array(
            'fill' => array(
                'type' => \PHPExcel_Style_Fill::FILL_SOLID,
                'color' => array('rgb' => 'BFBFBF')
            ),));


        $phpExcelObject = $this->formACell($phpExcelObject, 'Ordre de Livraison', 'B2', 'L2', 'center', true, 'Arial', 'none', true, 26, 'FF0000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre intégrée Spécifique', 'B3', 'L3', 'center', true, 'Arial', 'none', true, 30, '000000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Votre référence :', 'C4', 'C4', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $name, 'E4', 'E4', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Distributeur', 'G4', 'H4', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J4', 'K4', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Enregistré le :', 'C6', 'C6', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, date('d/m/y'), 'E6', 'E6', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de C de Distribtr:', 'G6', 'H6', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J6', 'K6', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de la Demande :', 'C8', 'C8', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $name, 'E8', 'E8', 'center', true, 'Arial', 'none', true, 24, 'FF0000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Livrable le:', 'G8', 'H8', 'left', true, 'Arial', 'none', false, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, date('d/m/y', strtotime("+7 day")), 'J8', 'K8', 'center', true, 'Arial', 'none', false, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'ADRESSE DE LIVRAISON :', 'C10', 'E10', 'right', true, 'Arial', 'none', true, 18, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'REGION:', 'G10', 'H10', 'left', true, 'Arial', 'none', true, 16, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'IDF', 'J10', 'K10', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Site EDF de livraison :', 'C12', 'C12', 'right', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Adresse (rue, bat, étage) :', 'C13', 'C13', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Code postal et Ville :', 'C14', 'C14', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Contact sur site 1 :', 'C15', 'C15', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de téléphone contact 1 :', 'C16', 'C16', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Email 1:', 'C17', 'C17', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Contact sur site 2 :', 'C18', 'C18', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de téléphone contact 2 :', 'C19', 'C19', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Email 2 :', 'C20', 'C20', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de tél du site (standard) :', 'C21', 'C21', 'right', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Contraintes de livraison :', 'C22', 'C22', 'right', true, 'Arial', 'none', true, 14, 'FF0000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'C23', 'C23', 'right', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getName(), 'E12', 'G12', 'left', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getAdresse(), 'E13', 'G13', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getCodePostal().' '.$siteDetail->getVille(), 'E14', 'G14', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        if($siteDetail->getContact1() != null) {
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getName() . ' ' . $contact1->getSurname(), 'E15', 'G15', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getFixePhone() . ' / ' . $contact1->getMobilePhone(), 'E16', 'G16', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getMail(), 'E17', 'G17', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        }
        if($siteDetail->getContact2() != null) {
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getName().' '.$contact2->getSurname(), 'E18', 'G18', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getFixePhone().' / '.$contact2->getMobilePhone(), 'E19', 'G19', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getMail(), 'E20', 'G20', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        }

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getMainPhone(), 'E21', 'G21', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getSpecialComment(), 'E22', 'K23', 'center', true, 'Arial', 'none', true, 14, 'FF0000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getRspOrder(), 'H12', 'K12', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'H13', 'K21', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'DETAIL APPROVISIONNEMENT', 'C25', 'K25', 'center', true, 'Arial', 'none', true, 16, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Description des configurations de base', 'C27', 'E27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Qté', 'G27', 'H27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Date', 'J27', 'K27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Poste FIXE', 'C28', 'K28', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, 'HP Z230 SCIENTIFIQUE

',
            true, false, 'Arial', 'none', 12, '538DD5');

        $this->richTectCreate($objRichText, ' DD de 2To - RAM : 16 Go
Carte graphique NVIDIA  QUADRO K2000 2Go ou NVIDIA  QUADRO K2200 2Go
+ 1 adaptateur display port

+ 2 écrans 24" (Pour le destockage merci de prendre l\'OL Ecran)',
            false, true, 'Arial', 'none', 12, '003366');

        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText,'C29', 'C29', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, '
ACER VERITON X2632G

',
            true, false, 'Arial', 'none', 12, '538DD5');
        $this->richTectCreate($objRichText, '1DD 500 Go - RAM : 4 GB
carte graphique INTEL HD
Processeur : INTEL celeron G1820

+ 1 écrans 22" (Pour le destockage merci de prendre l\'OL Ecran)',
            false, true, 'Arial', 'none', 12, '003366');

        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C30', 'C30', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS CAO
Offre SOLUTIONS SCIENTIFIQUES
', 'E29', 'E29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '
Offre SOLUTIONS TECHNIQUES
', 'E30', 'E30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $fixe1, 'G29', 'H29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $fixe2, 'G30', 'H30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J29', 'K29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J30', 'K30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C29', 'K30');
        $phpExcelObject = $this->setTopBorderLight($phpExcelObject, 'C30', 'K30');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Poste FIXE BOOSTE', 'C31', 'K31', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, 'LENOVO P700

',
            true, false, 'Arial', 'none', 12, '538DD5');
        $this->richTectCreate($objRichText, 'Bi-processeur
2 DD de 2 To RAM : 32 Go
Carte graphique NVIDIA  QUADRO K2200 2Go
+ Dongle DP to DVI
Processeur : Intel Core Xéon E5-2620

+ 2 écrans 22" (Pour le destockage merci de prendre l\'OL Ecran)',
            false, true, 'Arial', 'none', 12, '003366');
        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C32', 'C32', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, 'LENOVO C30

',
            true, false, 'Arial', 'none', 12, '538DD5');
        $this->richTectCreate($objRichText, 'Mono-processeur
1 DD de 1To- RAM : 16 Go
Carte graphique Avancée VIDIA  QUADRO K600 1Go
+ Dongle DP to DVI

+ 2 écrans 22" (Pour le destockage merci de prendre l\'OL Ecran)',
            false, true, 'Arial', 'none', 12, '003366');
        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C33', 'C33', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS SCIENTIFIQUES', 'E32', 'E33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $fixeBoost1, 'G32', 'H32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $fixeBoost2, 'G33', 'H33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J32', 'K32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J33', 'K33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C32', 'K33');
        $phpExcelObject = $this->setTopBorderLight($phpExcelObject, 'C33', 'C33');
        $phpExcelObject = $this->setTopBorderLight($phpExcelObject, 'G33', 'K33');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Poste PORTABLE', 'C34', 'K34', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, 'HP ZBOOK 15 G2

',
            true, false, 'Arial', 'none', 12, '538DD5');
        $this->richTectCreate($objRichText, '1 DD de 500 Go - RAM : 16 Gb
Carte graphique NVIDIA QUADRO K1100M-2Go
Processeur: Intel core i7-   4710MQ',
            false, true, 'Arial', 'none', 12, '003366');

        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C35', 'C35', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, '
LENOVO L440

',
            true, false, 'Arial', 'none', 12, '538DD5');
        $this->richTectCreate($objRichText, ' DD de 500 Go SSHD - RAM :2 x 4 Go
Carte graphique: Intel HD Graphics 4600
Processeur Intel Core i5-4210M ',
            false, true, 'Arial', 'none', 12, '003366');
        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C36', 'C36', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS CAO
Offre SOLUTIONS SCIENTIFIQUES
', 'E35', 'E35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS TECHNIQUES', 'E36', 'E36', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $portable1, 'G35', 'H35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $portable2, 'G36', 'H36', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J35', 'K35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J36', 'K36', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->setBorder($phpExcelObject, 'C35', 'K36');


        $phpExcelObject = $this->formACell($phpExcelObject, 'Poste PORTABLE BOOSTE', 'C37', 'K37', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');

        $objRichText = new \PHPExcel_RichText();
        $this->richTectCreate($objRichText, 'LENOVO L540

',
            true, false, 'Arial', 'none', 12, '333399');
        $this->richTectCreate($objRichText, '1 DD de 500 Go SSHD - RAM :2 x 4 Go
Carte graphique: Intel HD Graphics 4600
Processeur Intel Core i5-4210M',
            false, true, 'Arial', 'none', 12, '003366');

        $phpExcelObject = $this->formACell($phpExcelObject, $objRichText, 'C38', 'C38', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS TECHNIQUES', 'E38', 'E38', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $portableBoost1, 'G38', 'H38', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J38', 'K38', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C38', 'K38');
        $phpExcelObject = $this->setTopBorderLight($phpExcelObject, 'C36', 'K36');


        $phpExcelObject = $this->formACell($phpExcelObject, 'Commentaires', 'C41', 'K41', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $comments, 'C43', 'K45', 'left', true, 'Arial', 'single', true, 12, '000000', 'FFFFFF');

        // Set active sheet index to the first sheet, so Excel opens this as the first sheet
        $phpExcelObject->setActiveSheetIndex(0);

        // create the writer
        $writer = $phpExcelObjectFactory->createWriter($phpExcelObject, 'Excel5');
        // create the response
        $response = $phpExcelObjectFactory->createStreamedResponse($writer);
        // adding headers
        $dispositionHeader = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $name.'.xls'
        );
        $response->headers->set('Content-Type', 'text/vnd.ms-excel; charset=utf-8');
        $response->headers->set('Pragma', 'public');
        $response->headers->set('Cache-Control', 'maxage=1');
        $response->headers->set('Content-Disposition', $dispositionHeader);

        return $response;
    }
}