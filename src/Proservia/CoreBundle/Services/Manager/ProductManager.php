<?php
namespace Proservia\CoreBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Entity\Product;

/**
 * Class ProductManager
 * @package Proservia\CoreBundle\Services\Manager
 */
class ProductManager extends AbstractManager
{
    /**
     * @return array
     */
    public function createList()
    {
        $datas      = $this->getRepository()->findBy(array('isArchived' => 0), array('name' => 'ASC'));
        $finalDatas = [];
        foreach ($datas as $data) {
            $finalDatas[$data->getName()] = $data->getId();
        }
        return $finalDatas;
    }

    /**
     * @param $itemName
     * @return null|object
     */
    public function loadByName($itemName) {
        return $this->getRepository()->findOneBy(array('name' => $itemName));
    }
}