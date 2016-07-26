<?php
namespace Proservia\OrdresLivraisonBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\OrdresLivraisonBundle\Form\ScreenOrderType;
use Proservia\OrdresLivraisonBundle\Entity\ScreenOrder;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class ProductController
 * @package Proservia\OrdresLivraisonBundle\Controller
 */
class ScreenOrderController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('ScreenOrder', 'order', 'OrdresLivraisonBundle', ScreenOrder::class, ScreenOrderType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('ScreenOrder');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(ScreenOrder::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(ScreenOrderType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cet OL');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('order');
        $this->get('core.'.$service.'.controller_service')->setBundleName('OrdresLivraisonBundle');
    }

    /**
     * @Route(path="/orders/screen_order", name="liste_des_screen_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/orders/screen_order/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_screenorder")
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
     * @Route(path="/orders/screen_order/add", name="form_exec_add_screen_order")
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
     * @Route(path="/orders/screen_order/edit", name="form_exec_edit_screen_order")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}