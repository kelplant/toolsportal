<?php
namespace Proservia\CoreBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Entity\Site;

/**
 * Class SiteManager
 * @package Proservia\CoreBundle\Services\Manager
 */
class SiteManager extends AbstractManager
{
    /**
     * @return array
     */
    public function createList()
    {
        $datas      = $this->getRepository()->findAll();
        $finalDatas = [];
        foreach ($datas as $data) {
            $finalDatas[$data->getPublicName()] = $data->getId();
        }
        return $finalDatas;
    }
}