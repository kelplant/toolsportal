<?php
namespace Proservia\GestionReparationBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class TicketEventFileManager
 * @package Proservia\GestionReparationBundle\Services\Manager
 */
class TicketEventFileManager extends AbstractManager
{
    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findByTicketEventId($itemLoad);

        $finalTab = [];

        foreach ($itemToTransform as $item) {

            $itemArray = [];

            $itemArray['id']               = $item->getId();
            $itemArray['ticketId']         = $item->getTicketId();
            $itemArray['ticketEventId']    = $item->getTicketEventId();
            $itemArray['originalFileName'] = $item->getOriginalFileName();
            $itemArray['stockFileName']    = $item->getStockFileName();

            $finalTab[] = $itemArray;
        }

        return $finalTab;
    }
}