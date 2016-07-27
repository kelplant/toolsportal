<?php
namespace Proservia\CoreBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\CoreBundle\Form\EtiquetteListType;
use Proservia\CoreBundle\Entity\EtiquetteList;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class EtiquetteListController
 * @package Proservia\CoreBundle\Controller
 */
class EtiquetteListController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('EtiquetteList', 'core', 'CoreBundle', EtiquetteList::class, EtiquetteListType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('EtiquetteList');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(EtiquetteList::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(EtiquetteListType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('ce produit');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('core');
        $this->get('core.'.$service.'.controller_service')->setBundleName('CoreBundle');
    }

    /**
     * @Route(path="/divers/etiquette_list", name="liste_des_etiquette_list")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/divers/etiquette_list/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_etiquettelist")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('core.etiquettelist_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/divers/etiquette_list/add", name="form_exec_add_etiquette_list")
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
     * @Route(path="/divers/etiquette_list/edit", name="form_exec_edit_etiquette_list")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }

    /**
     * @param $lineToInsert
     * @Route(path="/ajax/insert/scope_import/{lineToInsert}",name="ajax_insert_etiquette_list")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function addScopeAssetsViaFiles($lineToInsert)
    {
        $explodedTab = array();
        $explodedTab[] = explode(";", $lineToInsert);
        $check = $this->get('core.etiquettelist_manager')->getRepository()->findOneByName(str_replace("\"", "", $explodedTab[0][0]));
        if ($check == null) {
            return new JsonResponse($this->get('core.etiquettelist_manager')->addFromApi(str_replace("\"", "", $explodedTab[0][0]), str_replace("\"", "", $explodedTab[0][1]), $this->get('core.product_manager')->loadByName(str_replace("\"", "", str_replace("-5-8-3-", "/", $explodedTab[0][2])))->getId(), str_replace("\"", "", $explodedTab[0][3])));
        } else {
            return new JsonResponse("0");
        }

    }

    /**
     * @param $itemLoad
     * @Route(path="/ajax/dsp_infos/get/{itemLoad}", name="ajax_get_dsp_info")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function ajaxGetDSPINfos($itemLoad)
    {
        return new JsonResponse($this->get('core.etiquettelist_manager')->createArray($itemLoad));
    }

    /**
     * @Route(path="/ajax/etiquette_list/get/full/", name="ajax_get_dsp_full_list")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function ajaxGetDSPList(Request $request)
    {
        $datas = $this->get('core.etiquettelist_manager')->getDSP($request->query->get('q'));

        return  new JsonResponse($datas); // il n'y a plus qu'à convertir en JSON
    }
}