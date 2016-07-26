<?php
namespace Proservia\OrdresLivraisonBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Services\Manager\SiteManager;
use Proservia\OrdresLivraisonBundle\Entity\SpecifiqueOrder;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class SpecifiqueOrderManager
 * @package Proservia\OrdresLivraisonBundle\Services\Manager
 */
class SpecifiqueOrderManager extends AbstractManager
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
            $name = 'IDF'.$this->siteManager->load($itemLoad['site'])->getShortName().date('ymd').'BUR';
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

        $itemArray['id']             = $itemToTransform->getId();
        $itemArray['name']           = $itemToTransform->getName();
        $itemArray['site']           = $itemToTransform->getSite();
        $itemArray['fixe1']          = $itemToTransform->getFixe1();
        $itemArray['fixe2']          = $itemToTransform->getFixe2();
        $itemArray['fixeBoost1']     = $itemToTransform->getFixeBoost1();
        $itemArray['fixeBoost2']     = $itemToTransform->getFixeBoost2();
        $itemArray['portable1']      = $itemToTransform->getPortable1();
        $itemArray['portable2']      = $itemToTransform->getPortable2();
        $itemArray['portableBoost1'] = $itemToTransform->getPortableBoost1();
        $itemArray['comments']       = $itemToTransform->getComments();

        return $itemArray;
    }
}