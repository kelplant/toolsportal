<?php
namespace Proservia\GestionReparationBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class TicketEventsManager
 * @package Proservia\GestionReparationBundle\Services\Manager
 */
class TicketEventsManager extends AbstractManager
{

    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findByTicketId($itemLoad);

        $finalTab = [];

        foreach ($itemToTransform as $item) {

            $itemArray = [];

            $itemArray['id']          = $item->getId();
            $itemArray['user']        = $item->getUser();
            $itemArray['event']       = $item->getEvent();
            $itemArray['ticketId']    = $item->getTicketId();
            $itemArray['status']      = $item->getStatus();
            $itemArray['commentaire'] = $item->getCommentaire();
            $itemArray['createdAt']   = $item->getCreatedAt()->format("d-m-Y");

            $finalTab[] = $itemArray;
        }

        return $finalTab;
    }
}