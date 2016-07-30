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

        $stmt = $this->em->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }
}