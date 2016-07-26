<?php
namespace Proservia\GestionReparationBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\GestionReparationBundle\Form\PanneType;
use Proservia\GestionReparationBundle\Entity\Panne;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class PanneController
 * @package Proservia\GestionReparationBundle\Controller
 */
class PanneController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('Panne', 'repair', 'GestionReparationBundle', Panne::class, PanneType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('Panne');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(Panne::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(PanneType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('cette panne');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('repair');
        $this->get('core.'.$service.'.controller_service')->setBundleName('GestionReparationBundle');
    }

    /**
     * @Route(path="/repair/panne", name="liste_panne")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/panne/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_panne")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('repair.panne_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/repair/panne/add", name="form_exec_add_panne")
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
     * @Route(path="/repair/panne/edit", name="form_exec_edit_panne")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }
}