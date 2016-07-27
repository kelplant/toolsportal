<?php
namespace Proservia\CoreBundle\Services\Manager;

use AppBundle\Services\Manager\AbstractManager;
use Proservia\CoreBundle\Entity\EtiquetteList;
use Proservia\CoreBundle\Entity\SelectJsonResponse;
use Proservia\CoreBundle\Entity\SendJsonResponse;

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


    /**
     * @return mixed
     */
    public function getlist()
    {
        $sql = "SELECT a.id, a.name, a.serial, a.buy_mode, b.name AS product FROM edf_sync_etiquette_liste a LEFT JOIN edf_product b ON b.id = a.product";

        $stmt = $this->em->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * @param $term
     * @return mixed
     */
    public function getDSP($term)
    {
        $sql = "SELECT a.name FROM edf_sync_etiquette_liste a WHERE a.name LIKE '%".$term."%'";

        $stmt = $this->em->getConnection()->prepare($sql);
        $stmt->execute();
        $blop = $stmt->fetchAll();

        $finaltab = [];
        foreach ($blop as $item) {
            $reg = new SelectJsonResponse();
            $reg->setId($item['name']);
            $reg->setText($item['name']);
            array_push($finaltab, $reg);
        }
        $finalObj = new SendJsonResponse();
        $finalObj->setItems($finaltab);
        return $finalObj;
    }}