<?php
namespace Proservia\GestionReparationBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\GestionReparationBundle\Form\PanneCategoryType;
use Proservia\GestionReparationBundle\Entity\PanneCategory;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class PanneCategoryController
 * @package Proservia\GestionReparationBundle\Controller
 */
class PanneCategoryController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('PanneCategory', 'repair', 'GestionReparationBundle', PanneCategory::class, PanneCategoryType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('PanneCategory');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(PanneCategory::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(PanneCategoryType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cette categorie de panne');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('repair');
        $this->get('core.'.$service.'.controller_service')->setBundleName('GestionReparationBundle');
    }

    /**
     * @Route(path="/repair/panne_category", name="liste_panne_category")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/panne_category/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_pannecategory")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('repair.panne_category_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/repair/panne_category/add", name="form_exec_add_panne_category")
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
     * @Route(path="/repair/panne_category/edit", name="form_exec_edit_panne_category")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}