<?php
namespace Proservia\CoreBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Entity\EtiquetteList;

/**
 * Class EtiquetteListManager
 * @package Proservia\CoreBundle\Services\Manager
 */
class EtiquetteListManager extends AbstractManager
{
    /**
     * @param $dsp
     * @param $serial
     * @param $model
     * @param $buymode
     * @return string
     */
    public function addFromApi($dsp, $serial, $model, $buymode)
    {
        $itemToSet = new $this->entity;
        try {
            $itemToSet->setName($dsp);
            $itemToSet->setSerial($serial);
            $itemToSet->setProduct($model);
            $itemToSet->setBuyMode($buymode);
            $itemToSet->setCreatedAt(new \DateTime());
            $this->save($itemToSet);
            return '1';
        } catch (\Exception $e) {
            return '0';
        }
    }

    /**
     * @param $itemLoad
     * @return mixed
     */
    public function createArray($itemLoad)
    {
        $itemToTransform = $this->getRepository()->findOneByName($itemLoad);

        $itemArray = [];

        $itemArray['id']      = $itemToTransform->getId();
        $itemArray['name']    = $itemToTransform->getName();
        $itemArray['serial']  = $itemToTransform->getSerial();
        $itemArray['product'] = $itemToTransform->getProduct();
        $itemArray['buyMode'] = $itemToTransform->getBuyMode();

        return $itemArray;
    }
}