<?php
namespace Proservia\CoreBundle\Controller;

use Proservia\CoreBundle\Form\ProductCategoryType;
use Proservia\CoreBundle\Entity\ProductCategory;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class ProductCategoryController
 * @package Proservia\CoreBundle\Controller
 */
class ProductCategoryController extends Controller
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->get('core.'.$service.'.controller_service')->setEntity('ProductCategory');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(ProductCategory::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(ProductCategoryType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cette catégorue de produit');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array());
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('core');
        $this->get('core.'.$service.'.controller_service')->setBundleName('CoreBundle');
    }

    /**
     * @Route(path="/divers/products_category", name="liste_des_category")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/divers/products_category/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_productcategory")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('core.product_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/divers/products_category/add", name="form_exec_add_product_category")
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
     * @Route(path="/divers/products_category/edit", name="form_exec_edit_product_category")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}