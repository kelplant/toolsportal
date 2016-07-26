<?php
namespace Proservia\OrdresLivraisonBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Services\Manager\SiteManager;
use Proservia\OrdresLivraisonBundle\Entity\ScreenOrder;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class ScreenOrderManager
 * @package Proservia\OrdresLivraisonBundle\Services\Manager
 */
class ScreenOrderManager extends AbstractManager
{
    /**
     * @var SiteManager
     */
    protected $siteManager;

    /**
     * ScreenOrderManager constructor.
     * @param ManagerRegistry $managerRegistry
     * @param Session $session
     * @param SiteManager $siteManager
     */
    public function __construct(ManagerRegistry $managerRegistry, Session $session, SiteManager $siteManager)
    {
        $this->managerRegistry = $managerRegistry;
        $this->session         = $session;
        $this->siteManager     = $siteManager;
    }

    /**
     * @param $itemLoad
     * @return array
     */
    public function add($itemLoad)
    {
        $itemToSet = $itemToSend = new $this->entity;
        $todayAlreadyCreate = $this->getRepository()->findBy(array('date' => date('Y-m-d'), 'site' => $itemLoad['site']));
        $listToday = [];
        foreach ($todayAlreadyCreate as $item) {
            $listToday[] = $item->getNumOfTheDay();
        }
        if ($todayAlreadyCreate == null) {
            $numOfTheDay = 1;
        } else {
            $numOfTheDay = max($listToday) + 1;
        }
        try {
            $itemToSet = $this->globalSetItem($itemToSet, $itemLoad);
            $name = 'IDF'.$this->siteManager->load($itemLoad['site'])->getShortName().date('ymd').'ECR';
            if ($numOfTheDay != 1) {
                $name = $name.$numOfTheDay;
            }
            $itemToSet->setName($name);
            $itemToSet->setDate(date('Y-m-d'));
            $itemToSet->setCreatedAt(new \DateTime());
            $itemToSet->setNumOfTheDay($numOfTheDay);
            $this->save($itemToSet);
            $this->appendSessionMessaging(array('errorCode' => 0, 'message' => $this->argname.' a eté correctionement Créé(e)'));
        } catch (\Exception $e) {
            $this->appendSessionMessaging(array('errorCode' => error_log($e->getMessage()), 'message' => $e->getMessage()));
        }
        return array('item' => $itemToSend);
    }

    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findOneById($itemLoad);

        $itemArray = [];

        $itemArray['id']       = $itemToTransform->getId();
        $itemArray['name']     = $itemToTransform->getName();
        $itemArray['site']     = $itemToTransform->getSite();
        $itemArray['qt24bd1']  = $itemToTransform->getQt24bd1();
        $itemArray['qt24bd2']  = $itemToTransform->getQt24bd2();
        $itemArray['qt22bd1']  = $itemToTransform->getQt22bd1();
        $itemArray['qt22bd2']  = $itemToTransform->getQt22bd2();
        $itemArray['qt19bd1']  = $itemToTransform->getQt19bd1();
        $itemArray['comments'] = $itemToTransform->getComments();

        return $itemArray;
    }
}