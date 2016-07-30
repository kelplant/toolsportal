<?php
namespace Proservia\OrdresLivraisonBundle\Services;

use PHPExcel_Style_Alignment;
use PHPExcel_Style_Font;
use PHPExcel_Style_Color;
use PHPExcel_Style_Border;
use Liuggio\ExcelBundle\Factory as phpexcelfactory;
use Proservia\CoreBundle\Services\Manager\ContactManager;
use Proservia\CoreBundle\Services\Manager\SiteManager;

abstract class AbstractGenerateXls
{
    /**
     * @var SiteManager
     */
    protected $siteManager;

    /**
     * @var ContactManager
     */
    protected $contactManager;

    /**
     * AbstractGenerateXls constructor.
     * @param SiteManager $siteManager
     * @param ContactManager $contactManager
     */
    public function __construct(SiteManager $siteManager, ContactManager $contactManager)
    {
        $this->siteManager = $siteManager;
        $this->contactManager = $contactManager;
    }

    /**
     * @param \PHPExcel $phpExcelObject
     * @param $from
     * @param $to
     * @return \PHPExcel
     * @throws \PHPExcel_Exception
     */
    protected function setTopBorderLight(\PHPExcel $phpExcelObject, $from, $to)
    {
        $styleArray = array(
            'borders' => array(
                'top' => array(
                    'style' => PHPExcel_Style_Border::BORDER_THIN
                ),
            )
        );

        $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->applyFromArray($styleArray);

        return $phpExcelObject;
    }

    /**
     * @param \PHPExcel $phpExcelObject
     * @param $from
     * @param $to
     * @return \PHPExcel
     * @throws \PHPExcel_Exception
     */
    protected function setBorder(\PHPExcel $phpExcelObject, $from, $to)
    {
        $styleArray = array(
            'borders' => array(
                'top' => array(
                    'style' => PHPExcel_Style_Border::BORDER_MEDIUM
                ),
                'bottom' => array(
                    'style' => PHPExcel_Style_Border::BORDER_MEDIUM
                ),
                'left' => array(
                    'style' => PHPExcel_Style_Border::BORDER_MEDIUM
                ),
                'right' => array(
                    'style' => PHPExcel_Style_Border::BORDER_MEDIUM
                )
            )
        );

        $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->applyFromArray($styleArray);

        return $phpExcelObject;
    }

    /**
     * @param \PHPExcel $phpExcelObject
     * @param $text
     * @param $from
     * @param $to
     * @param $hcenter
     * @param $vcenter
     * @param $police
     * @param $underline
     * @param $bold
     * @param $size
     * @param $color
     * @param $bgcolor
     * @return \PHPExcel
     * @throws \PHPExcel_Exception
     */
    protected function formACell(\PHPExcel $phpExcelObject, $text, $from, $to, $hcenter, $vcenter, $police, $underline, $bold, $size, $color, $bgcolor)
    {
        $phpExcelObject->getActiveSheet()->mergeCells($from.':'.$to);
        $phpExcelObject->getActiveSheet()->setCellValue($from, $text);
        $phpExcelObject->getActiveSheet()->getStyle($from)->getAlignment()->setWrapText(true);
        switch($hcenter)
        {
            case 'center':
                $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
                break;

            case 'right':
                $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_RIGHT);
                break;

            case 'left':
                $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
                break;
        }


        if ($vcenter == true)
        {
            $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->getAlignment()->setVertical(PHPExcel_Style_Alignment::VERTICAL_CENTER);
        }
        $phpExcelObject->getActiveSheet()->getStyle($from.':'.$to)->applyFromArray($this->setPolice($police, $underline, $bold, $size, $color, $bgcolor));

        return $phpExcelObject;
    }

    /**
     * @param string $police
     * @param string $underline
     * @param boolean $bold
     * @param int $size
     * @param string $color
     * @param string $bgcolor
     * @return array
     */
    protected function setPolice($police, $underline, $bold, $size, $color, $bgcolor)
    {
        return array(
            'fill' => array(
                'type' => \PHPExcel_Style_Fill::FILL_SOLID,
                'color' => array('rgb' => $bgcolor)
            ),
            'font'  => array(
                'bold'      => $bold,
                'color'     => array('rgb' => $color),
                'size'      => $size,
                'name'      => $police,
                'underline' => $underline
            ));
    }

    protected function richTectCreate(\PHPExcel_RichText $objRichText, $text, $bold, $italic, $font, $whatisthis, $size, $color)
    {
        $run = $objRichText->createTextRun($text);
        $phpFont = new PHPExcel_Style_Font();
        $phpFont->setBold($bold);
        $phpFont->setItalic($italic);
        $phpFont->setName($font);
        $phpFont->setSize($size);

        $phpColor = new PHPExcel_Style_Color();
        $phpColor->setRGB($color);
        $run->setFont($phpFont);
        $run->getFont()->setColor($phpColor);

        return $run;
    }
}