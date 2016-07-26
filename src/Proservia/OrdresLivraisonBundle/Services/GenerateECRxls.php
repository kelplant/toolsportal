<?php
namespace Proservia\OrdresLivraisonBundle\Services;

use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use PHPExcel_Style_Alignment;
use PHPExcel_Style_Font;
use PHPExcel_Style_Color;
use PHPExcel_Style_Border;
use Liuggio\ExcelBundle\Factory as phpexcelfactory;

/**
 * Class GenerateECRxls
 * @package Proservia\OrdresLivraisonBundle\Services
 */
class GenerateECRxls extends AbstractGenerateXls
{

    public function generateECRxls($name, $site, $qt24b1, $qt24b2, $qt22b1, $qt22b2, $qt19b1, $comments)
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
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('2')->setWidth('44.14');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('3')->setWidth('0.58');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('4')->setWidth('47.57');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('5')->setWidth('0.50');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('6')->setWidth('14');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('7')->setWidth('11.29');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('8')->setWidth('0.75');
        $phpExcelObject->getActiveSheet()->getColumnDimensionByColumn('9')->setWidth('12.57');
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
        $phpExcelObject->getActiveSheet()->getRowDimension(27)->setRowHeight('32.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(28)->setRowHeight('39.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(29)->setRowHeight('63.75');
        $phpExcelObject->getActiveSheet()->getRowDimension(30)->setRowHeight('44.50');
        $phpExcelObject->getActiveSheet()->getRowDimension(31)->setRowHeight('44.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(32)->setRowHeight('48');
        $phpExcelObject->getActiveSheet()->getRowDimension(33)->setRowHeight('44.50');
        $phpExcelObject->getActiveSheet()->getRowDimension(34)->setRowHeight('44.25');
        $phpExcelObject->getActiveSheet()->getRowDimension(35)->setRowHeight('26.50');
        $phpExcelObject->getActiveSheet()->getRowDimension(36)->setRowHeight('17.50');


        $phpExcelObject->getActiveSheet()->getSheetView()->setZoomScale(70);

        $phpExcelObject->getActiveSheet()->setTitle('OL'.date('ymd').'ECR');

        $phpExcelObject->getActiveSheet()->getStyle('B2:L54')->applyFromArray(array(
            'fill' => array(
                'type' => \PHPExcel_Style_Fill::FILL_SOLID,
                'color' => array('rgb' => 'BFBFBF')
            ),));


        $phpExcelObject = $this->formACell($phpExcelObject, 'Ordre de Livraison', 'B2', 'L2', 'center', true, 'Arial', 'none', true, 26, 'FF0000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Matériel Offre de Service', 'B3', 'L3', 'center', true, 'Arial', 'none', true, 30, '000000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Votre référence :', 'C4', 'C4', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $name, 'E4', 'E4', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Distributeur', 'G4', 'H4', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'SCC', 'J4', 'K4', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Enregistré le :', 'C6', 'C6', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, date('d/m/y'), 'E6', 'E6', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de C de Distribtr:', 'G6', 'H6', 'left', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J6', 'K6', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'N° de la Demande :', 'C8', 'C8', 'right', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $name, 'E8', 'E8', 'center', true, 'Arial', 'none', true, 24, 'FF0000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Livrable le:', 'G8', 'H8', 'left', true, 'Arial', 'none', false, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, date('d/m/y', strtotime("+7 day")), 'J8', 'K8', 'center', true, 'Arial', 'none', true, 20, '000000', 'FFFFFF');

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
        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getAdresse(), 'E13', 'G13', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getCodePostal().' '.$siteDetail->getVille(), 'E14', 'G14', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        if($siteDetail->getContact1() != null) {
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getName() . ' ' . $contact1->getSurname(), 'E15', 'G15', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getFixePhone() . ' / ' . $contact1->getMobilePhone(), 'E16', 'G16', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact1->getMail(), 'E17', 'G17', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        }
        if($siteDetail->getContact2() != null) {
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getName().' '.$contact2->getSurname(), 'E18', 'G18', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getFixePhone().' / '.$contact2->getMobilePhone(), 'E19', 'G19', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
            $phpExcelObject = $this->formACell($phpExcelObject, $contact2->getMail(), 'E20', 'G20', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        }

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getMainPhone(), 'E21', 'G21', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getSpecialComment(), 'E22', 'K23', 'center', true, 'Arial', 'none', true, 14, 'FF0000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, $siteDetail->getRspOrder(), 'H12', 'K12', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'H13', 'K21', 'left', true, 'Arial', 'none', true, 11, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'DETAIL APPROVISIONNEMENT', 'C25', 'K25', 'center', true, 'Arial', 'none', true, 16, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Description des configurations de base', 'C27', 'E27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Qté', 'G27', 'H27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Date', 'J27', 'K27', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');

        $phpExcelObject = $this->formACell($phpExcelObject, 'ECRAN 24"', 'C28', 'K28', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, '1 écran 24"', 'C29', 'C29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '2 écran 24"', 'C30', 'C30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre VIP Poste Ultra Léger                        Offre VIP-APPUI 1 Poste Portable                                   Offre VIP-APPUI 2 Poste FIXE                  Offre HANDICAP', 'E29', 'E29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS CAO                                 Offre SOLUTIONS SCIENTIFIQUES', 'E30', 'E30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $qt24b1, 'G29', 'H29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $qt24b2, 'G30', 'H30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J29', 'K29', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J30', 'K30', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C29', 'K29');
        $phpExcelObject = $this->setBorder($phpExcelObject, 'C30', 'K30');

        $phpExcelObject = $this->formACell($phpExcelObject, 'ECRAN 22"', 'C31', 'K31', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, '1 écran 22"', 'C32', 'C32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '2 écran 22"', 'C33', 'C33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS TECHNIQUES                               Offre ESSENTIEL SEDENTAIRE                  Offre HANDICAP', 'E32', 'E32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'Offre SOLUTIONS SCIENTIFIQUES', 'E33', 'E33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $qt22b1, 'G32', 'H32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $qt22b2, 'G33', 'H33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J32', 'K32', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J33', 'K33', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C32', 'K32');
        $phpExcelObject = $this->setBorder($phpExcelObject, 'C33', 'K33');

        $phpExcelObject = $this->formACell($phpExcelObject, 'ECRAN 19"', 'C34', 'K34', 'center', true, 'Arial', 'none', true, 20, '000000', 'BFBFBF');
        $phpExcelObject = $this->formACell($phpExcelObject, '1 écran 19"', 'C35', 'C35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, 'SPECIFIQUE POUR LA DC', 'E35', 'E35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $qt19b1, 'G35', 'H35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, '', 'J35', 'K35', 'center', true, 'Arial', 'none', true, 12, '000000', 'FFFFFF');

        $phpExcelObject = $this->setBorder($phpExcelObject, 'C35', 'K35');

        $phpExcelObject = $this->formACell($phpExcelObject, 'Commentaires', 'C37', 'K37', 'center', true, 'Arial', 'none', true, 14, '000000', 'FFFFFF');
        $phpExcelObject = $this->formACell($phpExcelObject, $comments, 'C39', 'K53', 'left', true, 'Arial', 'single', true, 12, '000000', 'FFFFFF');

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