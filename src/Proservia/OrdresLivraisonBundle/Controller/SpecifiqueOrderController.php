<?php
namespace Proservia\OrdresLivraisonBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\OrdresLivraisonBundle\Form\SpecifiqueOrderType;
use Proservia\OrdresLivraisonBundle\Entity\SpecifiqueOrder;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class SpecifiqueOrderController
 * @package Proservia\OrdresLivraisonBundle\Controller
 */
class SpecifiqueOrderController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('SpecifiqueOrder', 'order', 'OrdresLivraisonBundle', SpecifiqueOrder::class, SpecifiqueOrderType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('SpecifiqueOrder');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(SpecifiqueOrder::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(SpecifiqueOrderType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cet OL');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('order');
        $this->get('core.'.$service.'.controller_service')->setBundleName('OrdresLivraisonBundle');
    }

    /**
     * @Route(path="/orders/specifique_order", name="liste_des_specifique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/orders/specifique_order/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_specifiqueorder")
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
     * @Route(path="/orders/specifique_order/add", name="form_exec_add_specifique_order")
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
     * @Route(path="/orders/specifique_order/edit", name="form_exec_edit_specifique_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}