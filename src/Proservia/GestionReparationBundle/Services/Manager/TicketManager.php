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
}