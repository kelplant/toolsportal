<?php
namespace Proservia\GestionReparationBundle\Controller;

use AppBundle\Services\Core\AbstractControllerService;
use Proservia\GestionReparationBundle\Form\TicketType;
use Proservia\GestionReparationBundle\Entity\Ticket;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

/**
 * Class TicketController
 * @package Proservia\GestionReparationBundle\Controller
 */
class TicketController extends AbstractControllerService
{
    private $itemToTemove;

    /**
     *
     */
    private function initData($service)
    {
        $this->selfInit('Ticket', 'repair', 'GestionReparationBundle', Ticket::class, TicketType::class, array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setEntity('Ticket');
        $this->get('core.'.$service.'.controller_service')->setNewEntity(Ticket::class);
        $this->get('core.'.$service.'.controller_service')->setFormType(TicketType::class);
        $this->get('core.'.$service.'.controller_service')->setAlertText('ce ticket');
        $this->get('core.'.$service.'.controller_service')->setIsArchived(NULL);
        $this->get('core.'.$service.'.controller_service')->setCreateFormArguments(array('allow_extra_fields' => $this->generateListeChoices()));
        $this->get('core.'.$service.'.controller_service')->setServicePrefix('repair');
        $this->get('core.'.$service.'.controller_service')->setBundleName('GestionReparationBundle');
    }

    /**
     * @Route(path="/repair/ticket", name="liste_des_tickets_reparation")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function indexAction()
    {
        $this->initData('index');
        return $this->get('core.index.controller_service')->generateIndexAction(NULL);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/ticket/delete/{itemDelete}", defaults={"delete" = 0} , name="remove_ticket")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function deleteAction(Request $request)
    {
        $this->initData('delete');
        $this->initData('index');
        $this->itemToTemove = $request->get('itemDelete');
        $this->get('repair.ticket_manager')->remove($this->itemToTemove);
        return $this->get('core.delete.controller_service')->generateDeleteAction();
    }

    /**
     * @param Request $request
     * @Route(path="/repair/ticket/add", name="form_exec_add_ticket")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_addAction(Request $request)
    {
        $this->initData('add');
        $this->initData('index');
        $this->initBothForms();
        $this->formAdd->handleRequest($request);
        if ($this->formAdd->isSubmitted() && $this->formAdd->isValid()) {
            $return = $this->get('repair.ticket_manager')->add($request->request->get(strtolower($this->checkFormEntity($this->entity))));
            $this->get('repair.ticket_events_manager')->add(array('ticketId' => $return['item']->getId(), 'user' => $this->get('security.token_storage')->getToken()->getUser()->getId(), 'event' => 'Ouverture du Ticket', 'commentaire' => $request->request->get('ticket')['comment'], 'status' =>  'Ouvert'));
        }
        return $this->get('core.index.controller_service')->getFullList($this->isArchived, $this->formAdd, $this->formEdit);
    }

    /**
     * @param Request $request
     * @Route(path="/repair/ticket/edit", name="form_exec_edit_ticket")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function form_exec_editAction(Request $request)
    {
        $this->initData('edit');
        $this->initData('index');
        return $this->get('core.edit.controller_service')->executeRequestEditAction($request);
    }

    /**
     * @param $itemLoad
     * @Route(path="/ajax/ticket/get/{itemLoad}", name="ajax_get_ticket_info")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function ajaxGetTicket($itemLoad)
    {
        return new JsonResponse($this->get('repair.ticket_manager')->createArray($itemLoad));
    }


    /**
     * @param $itemLoad
     * @Route(path="/ajax/ticket_events/get/{itemLoad}", name="ajax_get_ticket_events_info")
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function ajaxGetTicketEvents($itemLoad)
    {
        $list = $this->get('repair.ticket_events_manager')->createArray($itemLoad);
        $finalTab = [];
        foreach ($list as $itemList) {
            $itemList['user'] = $this->get('fos_user.user_manager')->findUserBy(array('id' => $itemList['user']))->getUsername();
            $finalTab[] = $itemList;
        }
        return new JsonResponse($finalTab);
    }
}