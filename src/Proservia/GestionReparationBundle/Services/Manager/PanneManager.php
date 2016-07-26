<?php
namespace Proservia\GestionReparationBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Symfony\Bridge\Doctrine\ManagerRegistry;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\Validator\Constraints\DateTime;

/**
 * Class PanneManager
 * @package Proservia\GestionReparationBundle\Services\Manager
 */
class PanneManager extends AbstractManager
{
    /**
     * @return array
     */
    public function createListWithCat()
    {
        $datas      = $this->getRepository()->findAll();
        $finalDatas = [];
        foreach ($datas as $data) {
            $finalDatas[$data->getName()] = array('id' => $data->getId(), 'cat' => $data->getCategory());
        }
        return $finalDatas;
    }

}