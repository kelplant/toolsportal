<?php
namespace Proservia\GestionReparationBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class TicketManager
 * @package Proservia\GestionReparationBundle\Services\Manager
 */
class TicketManager extends AbstractManager
{
    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findOneById($itemLoad);

        $itemArray = [];

        $itemArray['id']            = $itemToTransform->getId();
        $itemArray['user']          = $itemToTransform->getUser();
        $itemArray['dsp']           = $itemToTransform->getDsp();
        $itemArray['product']       = $itemToTransform->getProduct();
        $itemArray['status']        = $itemToTransform->getStatus();
        $itemArray['typePanne']     = $itemToTransform->getTypePanne();
        $itemArray['endOfWarranty'] = $itemToTransform->getEndOfWarranty();
        $itemArray['typeWarranty']  = $itemToTransform->getTypeWarranty();
        $itemArray['panne']         = $itemToTransform->getPanne();
        $itemArray['serial']        = $itemToTransform->getSerial();
        $itemArray['site']          = $itemToTransform->getSite();
        $itemArray['comment']       = $itemToTransform->getComment();

        return $itemArray;
    }

    /**
     * @return mixed
     */
    public function getlist()
    {
        $sql = "SELECT a.id, f.username AS user, a.dsp, b.name AS product, a.status, d.name AS typePanne, a.end_of_warranty AS endOfWarranty, a.type_warranty AS typeWarranty, a.created_at AS createdAt, a.updated_at, a.is_archived AS isArchived, c.name AS panne, a.serial, e.public_name AS site, a.comment, a.buy_mode AS buyMode  FROM edf_repair_tickets a LEFT JOIN edf_product b ON a.product = b.id LEFT JOIN edf_repair_panne c ON a.panne = c.id LEFT JOIN edf_repair_panne_category d ON a.type_panne = d.id LEFT JOIN edf_site e ON a.site = e.id LEFT join fos_user f ON a.user = f.id";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function getlistPaginate()
    {
        $sql = "SELECT a.id, f.username AS user, a.dsp, b.name AS product, a.status, d.name AS typePanne, a.end_of_warranty AS endOfWarranty, a.type_warranty AS typeWarranty, a.created_at AS createdAt, a.updated_at, a.is_archived AS isArchived, c.name AS panne, a.serial, e.public_name AS site, a.comment, a.buy_mode AS buyMode  FROM edf_repair_tickets a LEFT JOIN edf_product b ON a.product = b.id LEFT JOIN edf_repair_panne c ON a.panne = c.id LEFT JOIN edf_repair_panne_category d ON a.type_panne = d.id LEFT JOIN edf_site e ON a.site = e.id LEFT join fos_user f ON a.user = f.id";

        return $this->executeRowQuery($sql);
    }

    /**
     * @param $since
     * @return mixed
     */
    public function countTicketByCreateDate($since, $to)
    {
        $sql = "SELECT count(*) as nbTicket FROM edf_repair_tickets WHERE created_at >= \"".$since."\" AND created_at <= \"".$to."\"";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countMoyenneJourNonResolu()
    {
        $sql = "SELECT ROUND(AVG(DATEDIFF(NOW(),created_at))) as nbJours FROM edf_repair_tickets WHERE status != 'Résolu'";

        return $this->executeRowQuery($sql);
    }

    /**
     * @param $since
     * @return mixed
     */
    public function countTicketBySolvedDate($since, $to)
    {
        $sql = "SELECT count(*) as nbTicket FROM edf_repair_tickets WHERE solved_at >= \"".$since."\" AND solved_at <= \"".$to."\" AND status = \"Résolu\"";
        return $this->executeRowQuery($sql);
    }



    /**
     * @return mixed
     */
    public function countTicketTotal()
    {
        $sql = "SELECT count(*) as nbTicket FROM edf_repair_tickets WHERE status != \"Résolu\"";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketByYearWeek()
    {
        $sql = "SELECT YEARWEEK(created_at) as ykwk, WEEKOFYEAR(created_at) as wk, YEAR(created_at) as yr, count(*) as item1 FROM `edf_repair_tickets` GROUP BY YEARWEEK(created_at)";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countSolvedTicketByYearWeek()
    {
        $sql = "SELECT YEARWEEK(solved_at) as ykwk, WEEKOFYEAR(solved_at) as wk, YEAR(solved_at) as yr, count(*) as item1 FROM `edf_repair_tickets` WHERE status = 'Résolu' GROUP BY YEARWEEK(solved_at)";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketByStatus()
    {
        $sql = "SELECT status, count(*) as nbTicket FROM `edf_repair_tickets` WHERE status != \"Résolu\"  GROUP BY status";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketByTypePanne()
    {
        $sql = "SELECT b.name as typePanne, count(a.id) as nbTicket FROM edf_repair_tickets a LEFT JOIN edf_repair_panne_category b ON a.type_panne=b.id WHERE a.status != \"Résolu\"  GROUP BY a.type_panne";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketByModelAndCategory()
    {
        $sql = "SELECT b.name as product, c.name AS catProduct, b.short_name AS shortName, count(a.id) as nbTicket FROM edf_repair_tickets a LEFT JOIN edf_product b ON a.product=b.id LEFT JOIN edf_product_category c ON c.id=b.category WHERE a.status != \"Résolu\"  GROUP BY a.product";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketByModelCategory()
    {
        $sql = "SELECT b.name as product, c.name AS catProduct, b.short_name AS shortName, count(a.id) as nbTicket FROM edf_repair_tickets a LEFT JOIN edf_product b ON a.product=b.id LEFT JOIN edf_product_category c ON c.id=b.category WHERE a.status != \"Résolu\"  GROUP BY c.name";

        return $this->executeRowQuery($sql);
    }

    /**
     * @return mixed
     */
    public function countTicketEndOfWarranty()
    {
        $sql = "SELECT DATE_FORMAT(`end_of_warranty`,'%Y%m') as yearmonth, count(*) as nbTicket FROM edf_repair_tickets WHERE status != \"Résolu\" AND end_of_warranty >= NOW() GROUP BY DATE_FORMAT(`end_of_warranty`,'%Y%m') ORDER BY DATE_FORMAT(`end_of_warranty`,'%Y%m')";
        return $this->executeRowQuery($sql);
    }
    /**
     * @return mixed
     */
    public function recursiveEndOfWeek()
    {
        $sql = "SELECT count(*) as nbTotal FROM edf_repair_tickets WHERE status != 'Résolu'";
        $total_number = $this->executeRowQuery($sql)[0]["nbTotal"];
        $sql = "SELECT YEARWEEK(created_at) as yrwk, count(*) as nbTotal FROM edf_repair_tickets GROUP BY YEARWEEK(created_at)";
        $createdArray = $this->executeRowQuery($sql);
        $dataTabCreatedArray = [];
        $weekTable = [];
        foreach ($createdArray as $item) {
            $dataTabCreatedArray[$item["yrwk"]] = $item["nbTotal"];
            $weekTable[] = $item["yrwk"];
        }
        $sql = "SELECT YEARWEEK(solved_at) as yrwk, count(*) as nbTotal FROM edf_repair_tickets WHERE solved_at IS NOT NULL GROUP BY YEARWEEK(solved_at)";
        $solvedArray = $this->executeRowQuery($sql);
        $dataTabSolvedArray = [];
        foreach ($solvedArray as $item) {
            $dataTabSolvedArray[$item["yrwk"]] = $item["nbTotal"];
            if (array_search($item["yrwk"], $weekTable) == NULL) {
                $weekTable[] = $item["yrwk"];
            }
        }
        sort($weekTable);
        array_unique($weekTable);
        $finalTab = [];
        $last_total = 0;
        $data1 = [];
        $data2 = [];
        foreach ($weekTable as $week) {
            if(isset($dataTabSolvedArray[$week]))
            {
                $solved = (int)$dataTabSolvedArray[$week];
            } else {
                $solved = 0;
            }
            $data1[] =  $solved;
            if(isset($dataTabCreatedArray[$week]))
            {
                $created = (int)$dataTabCreatedArray[$week];
            } else {
                $created = 0;
            }
            $data2[] = $created;
            $total =  $last_total + $created - $solved ;
            $finalTab[] = array('solved' => $solved, 'created' => $created, 'name' => $week, 'value' => $total);
            $last_total = $total;
        }

        return array('legend' => $weekTable, 'datas' => $finalTab, 'datas1' => $data1, 'datas2' => $data2);
    }


}