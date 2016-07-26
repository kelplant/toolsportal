<?php
namespace Proservia\OrdresLivraisonBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\OrdresLivraisonBundle\Form\BureautiqueOrderType;
use Proservia\OrdresLivraisonBundle\Entity\BureautiqueOrder;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class BureautiqueOrderController
 * @package Proservia\OrdresLivraisonBundle\Controller
 */
class BureautiqueOrderController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('BureautiqueOrder', 'order', 'OrdresLivraisonBundle', BureautiqueOrder::class, BureautiqueOrderType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('BureautiqueOrder');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(BureautiqueOrder::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(BureautiqueOrderType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cet OL');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('order');
        $this->get('core.'.$service.'.controller_service')->setBundleName('OrdresLivraisonBundle');
    }

    /**
     * @Route(path="/orders/bureautique_order", name="liste_des_bureautique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/orders/bureautique_order/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_bureautiqueorder")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('order.screen_order_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/orders/bureautique_order/add", name="form_exec_add_bureautique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_addAction(Request $request)
    {
        $this->initData('add');
        $this->initData('index');
        return $this->get('core.add.controller_service')->executeRequestAddAction($request);
    }

    /**
     * @param Request $request
     * @Route(path="/orders/bureautique_order/edit", name="form_exec_edit_bureautique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}