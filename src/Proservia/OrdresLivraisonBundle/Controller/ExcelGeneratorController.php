<?php
namespace Proservia\OrdresLivraisonBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class ExcelGeneratorController extends Controller
{
    /**
     * @param $id
     * @Route(path="/orders/excel/generate/screen/{id}" , name="generate_screen_excel")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateECRxls($id)
    {
        $datas = $this->get('order.screen_order_manager')->load($id);
        return $this->get('order.generate_ecr_xls')->generateECRxls($datas->getName(), $datas->getSite(), $datas->getQt24bd1(), $datas->getQt24bd2(), $datas->getQt22bd1(), $datas->getQt22bd2(), $datas->getQt19bd1(), $datas->getComments());
    }

    /**
     * @param $id
     * @Route(path="/orders/excel/generate/bur/{id}" , name="generate_bur_excel")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateBURxls($id)
    {
        $datas = $this->get('order.bureautique_order_manager')->load($id);
        return $this->get('order.generate_bur_xls')->generateBURxls($datas->getName(), $datas->getSite(), $datas->getFixe1(), $datas->getFixe2(), $datas->getFixeBoost1(), $datas->getPortable1(), $datas->getPortable2(), $datas->getPortableBoost1(), $datas->getPortableUL1(), $datas->getPortableUL2(), $datas->getComments());
    }

    /**
     * @param $id
     * @Route(path="/orders/excel/generate/spc/{id}" , name="generate_spc_excel")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function generateSPCxls($id)
    {
        $datas = $this->get('order.specifique_order_manager')->load($id);
        return $this->get('order.generate_spc_xls')->generateSPCxls($datas->getName(), $datas->getSite(), $datas->getFixe1(), $datas->getFixe2(), $datas->getFixeBoost1(), $datas->getFixeBoost2(), $datas->getPortable1(), $datas->getPortable2(), $datas->getPortableBoost1(), $datas->getComments());
    }

    /**
     * @param $olEdit
     * @Route(path="/ajax/specifique_order/get/{olEdit}",name="ajax_get_specifique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function specifiqueGetInfosIndex($olEdit)
    {
        return new JsonResponse($this->get('order.specifique_order_manager')->createArray($olEdit));
    }

    /**
     * @param $olEdit
     * @Route(path="/ajax/bureautique_order/get/{olEdit}",name="ajax_get_bureautique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function bureautiqueGetInfosIndex($olEdit)
    {
        return new JsonResponse($this->get('order.bureautique_order_manager')->createArray($olEdit));
    }

    /**
     * @param $olEdit
     * @Route(path="/ajax/screen_order/get/{olEdit}",name="ajax_get_screen_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function screenGetInfosIndex($olEdit)
    {
        return new JsonResponse($this->get('order.screen_order_manager')->createArray($olEdit));
    }
}